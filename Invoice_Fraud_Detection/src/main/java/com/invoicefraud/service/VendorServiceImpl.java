package com.invoicefraud.service;

import java.util.List;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.invoicefraud.dto.VendorRequestDTO;
import com.invoicefraud.dto.VendorResponseDTO;
import com.invoicefraud.entity.User;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.exception.DuplicateResourceException;
import com.invoicefraud.exception.ResourceNotFoundException;
import com.invoicefraud.mapper.VendorMapper;
import com.invoicefraud.repository.VendorRepository;
import com.invoicefraud.repository.InvoiceRepository;

@Service
public class VendorServiceImpl implements VendorService {

	private final VendorRepository vendorRepository;
	private final VendorMapper vendorMapper;
	private final AuditLogService auditLogService;
	private final InvoiceRepository invoiceRepository;
	private final CurrentUserService currentUserService;

	public VendorServiceImpl(
			VendorRepository vendorRepository,
			VendorMapper vendorMapper,
			AuditLogService auditLogService,
			InvoiceRepository invoiceRepository,
			CurrentUserService currentUserService) {
		this.vendorRepository = vendorRepository;
		this.vendorMapper = vendorMapper;
		this.auditLogService = auditLogService;
		this.invoiceRepository = invoiceRepository;
		this.currentUserService = currentUserService;
	}

	@Override
	@Transactional
	public VendorResponseDTO createVendor(VendorRequestDTO requestDTO) {
		User currentUser = currentUserService.getCurrentUser();
		validateVendorEmailIsUnique(requestDTO.getVendorEmail(), null, currentUser.getEmail());
		validateVendorNameIsUnique(requestDTO.getVendorName(), null, currentUser.getEmail());

		Vendor vendor = vendorMapper.toEntity(requestDTO);
		vendor.setUser(currentUser);
		Vendor savedVendor = vendorRepository.save(vendor);

		auditLogService.logAction(
				"VENDOR_CREATION",
				"Vendor",
				savedVendor.getId(),
				"Created vendor " + savedVendor.getVendorName() + " with email " + savedVendor.getVendorEmail()
		);

		return convertToResponseDTO(savedVendor);
	}

	@Override
	@Transactional(readOnly = true)
	public VendorResponseDTO getVendorById(Long id) {
		Vendor vendor = findVendorById(id, currentUserService.getCurrentUserEmail());
		return convertToResponseDTO(vendor);
	}

	@Override
	@Transactional(readOnly = true)
	public List<VendorResponseDTO> getAllVendors() {
		return vendorRepository.findAllByUserEmail(currentUserService.getCurrentUserEmail())
				.stream()
				.map(this::convertToResponseDTO)
				.toList();
	}

	@Override
	@Transactional
	public VendorResponseDTO updateVendor(Long id, VendorRequestDTO requestDTO) {
		String userEmail = currentUserService.getCurrentUserEmail();
		Vendor vendor = findVendorById(id, userEmail);
		validateVendorEmailIsUnique(requestDTO.getVendorEmail(), id, userEmail);
		validateVendorNameIsUnique(requestDTO.getVendorName(), id, userEmail);

		vendor.setVendorName(requestDTO.getVendorName());
		vendor.setVendorEmail(requestDTO.getVendorEmail());
		vendor.setVendorPhone(requestDTO.getVendorPhone());
		vendor.setRiskScore(requestDTO.getRiskScore());

		Vendor updatedVendor = vendorRepository.save(vendor);

		auditLogService.logAction(
				"VENDOR_UPDATE",
				"Vendor",
				updatedVendor.getId(),
				"Updated vendor " + updatedVendor.getVendorName()
		);

		return convertToResponseDTO(updatedVendor);
	}

	@Override
	@Transactional
	public void deleteVendor(Long id) {
		Vendor vendor = findVendorById(id, currentUserService.getCurrentUserEmail());
		vendorRepository.delete(vendor);

		auditLogService.logAction(
				"VENDOR_DELETE",
				"Vendor",
				vendor.getId(),
				"Deleted vendor " + vendor.getVendorName()
		);
	}

	private VendorResponseDTO convertToResponseDTO(Vendor vendor) {
		if (vendor == null) {
			return null;
		}
		VendorResponseDTO dto = vendorMapper.toResponseDTO(vendor);
		if (dto != null) {
			String userEmail = vendor.getUser() != null ? vendor.getUser().getEmail() : currentUserService.getCurrentUserEmail();
			dto.setTotalInvoices(invoiceRepository.countByVendorIdAndUserEmail(vendor.getId(), userEmail));
			dto.setTotalFlaggedInvoices(invoiceRepository.countByVendorIdAndUserEmailAndFraudScoreGreaterThan(vendor.getId(), userEmail, new java.math.BigDecimal("30.00")));
		}
		return dto;
	}

	private Vendor findVendorById(Long id, String userEmail) {
		return vendorRepository.findByIdAndUserEmail(id, userEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));
	}

	private void validateVendorEmailIsUnique(String vendorEmail, Long currentVendorId, String userEmail) {
		if (vendorEmail == null || vendorEmail.isBlank()) {
			return;
		}

		vendorRepository.findByVendorEmailAndUserEmail(vendorEmail, userEmail)
				.filter(existingVendor -> !Objects.equals(existingVendor.getId(), currentVendorId))
				.ifPresent(existingVendor -> {
					throw new DuplicateResourceException("Vendor email already exists");
				});
	}

	private void validateVendorNameIsUnique(String vendorName, Long currentVendorId, String userEmail) {
		if (vendorName == null || vendorName.isBlank()) {
			return;
		}

		vendorRepository.findByVendorNameAndUserEmail(vendorName, userEmail)
				.filter(existingVendor -> !Objects.equals(existingVendor.getId(), currentVendorId))
				.ifPresent(existingVendor -> {
					throw new DuplicateResourceException("Duplicate Vendor Name");
				});
	}
}
