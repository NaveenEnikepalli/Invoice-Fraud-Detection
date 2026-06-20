package com.invoicefraud.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.invoicefraud.dto.FraudDetectionResult;
import com.invoicefraud.dto.InvoiceRequestDTO;
import com.invoicefraud.dto.InvoiceResponseDTO;
import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.User;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.enums.InvoiceStatus;
import com.invoicefraud.exception.DuplicateResourceException;
import com.invoicefraud.exception.ResourceNotFoundException;
import com.invoicefraud.mapper.InvoiceMapper;
import com.invoicefraud.repository.InvoiceRepository;
import com.invoicefraud.repository.VendorRepository;
import com.invoicefraud.repository.InvoiceDocumentRepository;
import com.invoicefraud.entity.InvoiceDocument;

@Service
public class InvoiceServiceImpl implements InvoiceService {

	private final InvoiceRepository invoiceRepository;
	private final VendorRepository vendorRepository;
	private final InvoiceMapper invoiceMapper;
	private final FraudDetectionService fraudDetectionService;
	private final AuditLogService auditLogService;
	private final CurrentUserService currentUserService;
	private final InvoiceDocumentRepository documentRepository;
	private final DocumentStorageService storageService;

	public InvoiceServiceImpl(
			InvoiceRepository invoiceRepository,
			VendorRepository vendorRepository,
			InvoiceMapper invoiceMapper,
			FraudDetectionService fraudDetectionService,
			AuditLogService auditLogService,
			CurrentUserService currentUserService,
			InvoiceDocumentRepository documentRepository,
			DocumentStorageService storageService) {
		this.invoiceRepository = invoiceRepository;
		this.vendorRepository = vendorRepository;
		this.invoiceMapper = invoiceMapper;
		this.fraudDetectionService = fraudDetectionService;
		this.auditLogService = auditLogService;
		this.currentUserService = currentUserService;
		this.documentRepository = documentRepository;
		this.storageService = storageService;
	}

	@Override
	@Transactional
	public InvoiceResponseDTO createInvoice(InvoiceRequestDTO requestDTO) {
		validateAmount(requestDTO);
		User currentUser = currentUserService.getCurrentUser();
		validateInvoiceNumberIsUnique(requestDTO.getInvoiceNumber(), null, currentUser.getEmail());

		Vendor vendor = findVendorById(requestDTO.getVendorId(), currentUser.getEmail());
		Invoice invoice = invoiceMapper.toEntity(requestDTO);
		invoice.setVendor(vendor);
		invoice.setUser(currentUser);

		// Run Fraud Detection before save
		List<Invoice> historicalInvoices = invoiceRepository.findByVendorIdAndUserEmail(vendor.getId(), currentUser.getEmail());
		FraudDetectionResult fraudResult = fraudDetectionService.detectFraud(invoice, historicalInvoices);
		invoice.setFraudScore(fraudResult.getFraudScore());

		Invoice savedInvoice = invoiceRepository.save(invoice);

		// Link document if documentId is provided in request
		if (requestDTO.getDocumentId() != null) {
			documentRepository.findByIdAndUserEmail(requestDTO.getDocumentId(), currentUser.getEmail())
					.ifPresent(doc -> {
						doc.setInvoice(savedInvoice);
						documentRepository.save(doc);
					});
		}

		// Update Vendor Risk Score dynamically
		List<Invoice> updatedHistoricalInvoices = invoiceRepository.findByVendorIdAndUserEmail(vendor.getId(), currentUser.getEmail());
		fraudDetectionService.updateVendorRiskScore(vendor, updatedHistoricalInvoices);

		// Log Action
		auditLogService.logAction(
				"INVOICE_CREATION",
				"Invoice",
				savedInvoice.getId(),
				"Created invoice " + savedInvoice.getInvoiceNumber() + " with amount " + savedInvoice.getAmount()
		);

		if (savedInvoice.getFraudScore() != null && savedInvoice.getFraudScore().compareTo(BigDecimal.ZERO) > 0) {
			auditLogService.logAction(
					"FRAUD_DETECTION",
					"Invoice",
					savedInvoice.getId(),
					"Fraud Detected on " + savedInvoice.getInvoiceNumber() + " (Score: " + savedInvoice.getFraudScore() + "%)"
			);
		}

		return invoiceMapper.toResponseDTO(savedInvoice);
	}

	@Override
	@Transactional(readOnly = true)
	public InvoiceResponseDTO getInvoiceById(Long id) {
		Invoice invoice = findInvoiceById(id, currentUserService.getCurrentUserEmail());
		return invoiceMapper.toResponseDTO(invoice);
	}

	@Override
	@Transactional(readOnly = true)
	public List<InvoiceResponseDTO> getAllInvoices() {
		return invoiceRepository.findAllByUserEmail(currentUserService.getCurrentUserEmail())
				.stream()
				.map(invoiceMapper::toResponseDTO)
				.toList();
	}

	@Override
	@Transactional
	public InvoiceResponseDTO updateInvoice(Long id, InvoiceRequestDTO requestDTO) {
		validateAmount(requestDTO);
		User currentUser = currentUserService.getCurrentUser();
		Invoice invoice = findInvoiceById(id, currentUser.getEmail());
		validateInvoiceNumberIsUnique(requestDTO.getInvoiceNumber(), id, currentUser.getEmail());

		Vendor vendor = findVendorById(requestDTO.getVendorId(), currentUser.getEmail());

		InvoiceStatus oldStatus = invoice.getStatus();

		invoice.setInvoiceNumber(requestDTO.getInvoiceNumber());
		invoice.setAmount(requestDTO.getAmount());
		invoice.setInvoiceDate(requestDTO.getInvoiceDate());
		invoice.setStatus(requestDTO.getStatus());
		invoice.setVendor(vendor);
		invoice.setUser(currentUser);
		invoice.setDescription(requestDTO.getDescription());

		// Run Fraud Detection before save
		List<Invoice> historicalInvoices = invoiceRepository.findByVendorIdAndUserEmail(vendor.getId(), currentUser.getEmail());
		FraudDetectionResult fraudResult = fraudDetectionService.detectFraud(invoice, historicalInvoices);
		invoice.setFraudScore(fraudResult.getFraudScore());

		Invoice updatedInvoice = invoiceRepository.save(invoice);

		// Link document if documentId is provided in request
		if (requestDTO.getDocumentId() != null) {
			documentRepository.findByIdAndUserEmail(requestDTO.getDocumentId(), currentUser.getEmail())
					.ifPresent(doc -> {
						doc.setInvoice(updatedInvoice);
						documentRepository.save(doc);
					});
		}

		// Update Vendor Risk Score dynamically
		List<Invoice> updatedHistoricalInvoices = invoiceRepository.findByVendorIdAndUserEmail(vendor.getId(), currentUser.getEmail());
		fraudDetectionService.updateVendorRiskScore(vendor, updatedHistoricalInvoices);

		// Log Action
		auditLogService.logAction(
				"INVOICE_UPDATE",
				"Invoice",
				updatedInvoice.getId(),
				"Updated invoice " + updatedInvoice.getInvoiceNumber()
		);

		if (oldStatus != updatedInvoice.getStatus()) {
			auditLogService.logAction(
					"INVOICE_STATUS_CHANGE",
					"Invoice",
					updatedInvoice.getId(),
					"Status changed from " + oldStatus + " to " + updatedInvoice.getStatus()
			);
		}

		if (updatedInvoice.getFraudScore() != null && updatedInvoice.getFraudScore().compareTo(BigDecimal.ZERO) > 0) {
			auditLogService.logAction(
					"FRAUD_DETECTION",
					"Invoice",
					updatedInvoice.getId(),
					"Fraud Detected on " + updatedInvoice.getInvoiceNumber() + " (Score: " + updatedInvoice.getFraudScore() + "%)"
			);
		}

		return invoiceMapper.toResponseDTO(updatedInvoice);
	}

	@Override
	@Transactional
	public void deleteInvoice(Long id) {
		String userEmail = currentUserService.getCurrentUserEmail();
		Invoice invoice = findInvoiceById(id, userEmail);
		Vendor vendor = invoice.getVendor();

		// Clean up invoice documents and storage files
		List<InvoiceDocument> docs = documentRepository.findAllByUserEmail(userEmail);
		for (InvoiceDocument doc : docs) {
			if (doc.getInvoice() != null && doc.getInvoice().getId().equals(invoice.getId())) {
				try {
					storageService.deleteFile(doc.getStoragePath());
				} catch (Exception e) {
					// log or ignore storage deletion failures to avoid breaking database transaction
				}
				documentRepository.delete(doc);
			}
		}

		invoiceRepository.delete(invoice);
		invoiceRepository.flush();

		// Update Vendor Risk Score dynamically after invoice deletion
		List<Invoice> updatedHistoricalInvoices = invoiceRepository.findByVendorIdAndUserEmail(vendor.getId(), userEmail);
		fraudDetectionService.updateVendorRiskScore(vendor, updatedHistoricalInvoices);

		auditLogService.logAction(
				"INVOICE_DELETE",
				"Invoice",
				invoice.getId(),
				"Deleted invoice " + invoice.getInvoiceNumber()
		);
	}

	@Override
	@Transactional(readOnly = true)
	public List<InvoiceResponseDTO> getInvoicesByVendor(Long vendorId) {
		String userEmail = currentUserService.getCurrentUserEmail();
		findVendorById(vendorId, userEmail);

		return invoiceRepository.findByVendorIdAndUserEmail(vendorId, userEmail)
				.stream()
				.map(invoiceMapper::toResponseDTO)
				.toList();
	}

	private Invoice findInvoiceById(Long id, String userEmail) {
		return invoiceRepository.findByIdAndUserEmail(id, userEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
	}

	private Vendor findVendorById(Long vendorId, String userEmail) {
		return vendorRepository.findByIdAndUserEmail(vendorId, userEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));
	}

	private void validateInvoiceNumberIsUnique(String invoiceNumber, Long currentInvoiceId, String userEmail) {
		invoiceRepository.findByInvoiceNumberAndUserEmail(invoiceNumber, userEmail)
				.filter(existingInvoice -> !Objects.equals(existingInvoice.getId(), currentInvoiceId))
				.ifPresent(existingInvoice -> {
					throw new DuplicateResourceException(
							"Invoice Number Already Exists");
				});
	}

	private void validateAmount(InvoiceRequestDTO requestDTO) {
		if (requestDTO.getAmount() == null || requestDTO.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
			throw new IllegalArgumentException("Invoice amount must be greater than zero");
		}
	}

	@Override
	@Transactional
	public InvoiceResponseDTO updateInvoiceNotes(Long id, String notes) {
		Invoice invoice = findInvoiceById(id, currentUserService.getCurrentUserEmail());
		invoice.setInvestigationNotes(notes);
		Invoice savedInvoice = invoiceRepository.save(invoice);

		auditLogService.logAction(
				"INVOICE_NOTES_UPDATE",
				"Invoice",
				savedInvoice.getId(),
				"Updated investigation notes for invoice " + savedInvoice.getInvoiceNumber()
		);

		return invoiceMapper.toResponseDTO(savedInvoice);
	}
}
