package com.invoicefraud.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.invoicefraud.dto.FraudDetectionResult;
import com.invoicefraud.dto.FraudExplanationResponseDTO;
import com.invoicefraud.dto.RelatedInvoiceDTO;
import com.invoicefraud.dto.VendorResponseDTO;
import com.invoicefraud.dto.AuditLogResponseDTO;
import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.exception.ResourceNotFoundException;
import com.invoicefraud.repository.InvoiceRepository;
// VendorRepository removed as it's unused
import com.invoicefraud.repository.AuditLogRepository;
import com.invoicefraud.mapper.VendorMapper;
import com.invoicefraud.mapper.AuditLogMapper;

@Service
public class FraudExplanationService {

	private final InvoiceRepository invoiceRepository;
	private final FraudDetectionService fraudDetectionService;
	private final VendorMapper vendorMapper;
	private final AuditLogRepository auditLogRepository;
	private final AuditLogMapper auditLogMapper;
	private final CurrentUserService currentUserService;

	public FraudExplanationService(
			InvoiceRepository invoiceRepository,
			FraudDetectionService fraudDetectionService,
			VendorMapper vendorMapper,
			AuditLogRepository auditLogRepository,
			AuditLogMapper auditLogMapper,
			CurrentUserService currentUserService) {
		this.invoiceRepository = invoiceRepository;
		this.fraudDetectionService = fraudDetectionService;
		this.vendorMapper = vendorMapper;
		this.auditLogRepository = auditLogRepository;
		this.auditLogMapper = auditLogMapper;
		this.currentUserService = currentUserService;
	}

	@Transactional(readOnly = true)
	public FraudExplanationResponseDTO explainFraud(Long invoiceId) {
		String userEmail = currentUserService.getCurrentUserEmail();
		Invoice invoice = invoiceRepository.findByIdAndUserEmail(invoiceId, userEmail)
				.orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + invoiceId));

		List<Invoice> historicalInvoices = invoiceRepository.findByVendorIdAndUserEmail(invoice.getVendor().getId(), userEmail);

		BigDecimal storedScore = invoice.getFraudScore() != null ? invoice.getFraudScore() : BigDecimal.ZERO;
		FraudDetectionResult result = fraudDetectionService.explainStoredFraud(invoice, historicalInvoices, storedScore);

		List<String> explanations = new ArrayList<>();
		List<String> reasons = new ArrayList<>();
		List<String> fraudReasons = new ArrayList<>();

		if (result.getFraudScore().compareTo(BigDecimal.ZERO) == 0) {
			explanations.add("No risk anomalies detected. The invoice appears normal.");
		} else {
			for (String triggeredRule : result.getTriggeredRules()) {
				if (triggeredRule.contains("Duplicate Invoice Number")) {
					explanations.add("Duplicate Invoice Number: An identical invoice number has already been processed for this vendor (+40).");
					reasons.add("Duplicate Invoice Number");
					fraudReasons.add("Duplicate Invoice Number");
				} else if (triggeredRule.contains("Duplicate Vendor and Amount")) {
					explanations.add("Duplicate Amount: Another invoice with the same amount from this vendor exists (+30).");
					reasons.add("Duplicate Amount");
					fraudReasons.add("Duplicate Amount");
				} else if (triggeredRule.contains("Vendor Previously Flagged")) {
					explanations.add("Vendor Mismatch: The vendor associated with this invoice has a previously flagged high risk profile (+20).");
					reasons.add("Vendor Mismatch");
					fraudReasons.add("Vendor Mismatch");
				} else if (triggeredRule.contains("Multiple Submissions")) {
					explanations.add("Frequency Anomaly: Multiple invoices submitted within a short time window (+15).");
					reasons.add("Frequency Anomaly");
					fraudReasons.add("Frequency Anomaly");
				} else if (triggeredRule.contains("Similar Invoice Number Detection")) {
					explanations.add("Similar Invoice Number: Typographical alterations or highly similar numbers detected against history database.");
					reasons.add("Similar Invoice Number");
					fraudReasons.add("Similar Invoice Number");
				} else if (triggeredRule.contains("Unusually High Amount")) {
					explanations.add("Suspicious Pattern: The invoice amount is unusually high or significantly exceeds the vendor average (+25).");
					reasons.add("Suspicious Pattern");
					fraudReasons.add("Suspicious Pattern");
				}
			}
		}

		String category = result.getRiskCategory();
		if ("Low".equalsIgnoreCase(category)) {
			explanations.add("The overall risk is low. No action is required.");
		} else if ("Medium".equalsIgnoreCase(category)) {
			explanations.add("The overall risk is medium. Please check the vendor details before processing payment.");
		} else if ("High".equalsIgnoreCase(category)) {
			explanations.add("The overall risk is high. Payment should be suspended pending review by an Auditor.");
		}

		String fraudStatus = "LOW_RISK";
		String riskLevel = "LOW";
		if ("Medium".equalsIgnoreCase(category)) {
			fraudStatus = "MEDIUM_RISK";
			riskLevel = "MEDIUM";
		} else if ("High".equalsIgnoreCase(category)) {
			fraudStatus = "HIGH_RISK";
			riskLevel = "HIGH";
		}

		java.math.RoundingMode rm = java.math.RoundingMode.HALF_UP;
		int riskScoreInt = result.getFraudScore().setScale(0, rm).intValue();

		// Compile relatedInvoices
		List<RelatedInvoiceDTO> relatedInvoices = new ArrayList<>();
		if (historicalInvoices != null) {
			for (Invoice hist : historicalInvoices) {
				if (hist.getId() != null && hist.getId().equals(invoice.getId())) {
					continue;
				}
				boolean isRelated = false;
				
				// 1. Same number
				if (invoice.getInvoiceNumber() != null && hist.getInvoiceNumber() != null &&
					invoice.getInvoiceNumber().trim().equalsIgnoreCase(hist.getInvoiceNumber().trim())) {
					isRelated = true;
				}
				// 2. Same vendor + amount
				if (invoice.getAmount() != null && hist.getAmount() != null &&
					invoice.getAmount().compareTo(hist.getAmount()) == 0) {
					isRelated = true;
				}
				// 3. Short time
				if (invoice.getInvoiceDate() != null && hist.getInvoiceDate() != null) {
					long days = Math.abs(java.time.temporal.ChronoUnit.DAYS.between(invoice.getInvoiceDate(), hist.getInvoiceDate()));
					if (days <= 1) {
						isRelated = true;
					}
				}
				
				if (isRelated) {
					String histVendorName = hist.getVendor() != null ? hist.getVendor().getVendorName() : "";
					relatedInvoices.add(new RelatedInvoiceDTO(hist.getId(), hist.getInvoiceNumber(), histVendorName, hist.getAmount(), hist.getInvoiceDate()));
				}
			}
		}

		// Compile vendor stats
		Vendor vendor = invoice.getVendor();
		VendorResponseDTO vendorInfo = null;
		if (vendor != null) {
			vendorInfo = vendorMapper.toResponseDTO(vendor);
			if (vendorInfo != null) {
				vendorInfo.setTotalInvoices(invoiceRepository.countByVendorIdAndUserEmail(vendor.getId(), userEmail));
				vendorInfo.setTotalFlaggedInvoices(invoiceRepository.countByVendorIdAndUserEmailAndFraudScoreGreaterThan(vendor.getId(), userEmail, new BigDecimal("30.00")));
			}
		}

		// Compile activity timeline
		List<AuditLogResponseDTO> timeline = auditLogRepository.findByUserEmailAndEntityNameAndEntityIdOrderByCreatedAtAsc(userEmail, "Invoice", invoice.getId())
				.stream()
				.map(auditLogMapper::toResponseDTO)
				.toList();

		FraudExplanationResponseDTO dto = new FraudExplanationResponseDTO();
		dto.setInvoiceId(invoice.getId());
		dto.setInvoiceNumber(invoice.getInvoiceNumber());
		dto.setFraudScore(result.getFraudScore());
		dto.setRiskCategory(category);
		dto.setExplanations(explanations);
		dto.setRiskScore(riskScoreInt);
		dto.setFraudStatus(fraudStatus);
		dto.setReasons(reasons);
		
		dto.setVendorName(invoice.getVendor() != null ? invoice.getVendor().getVendorName() : null);
		dto.setRiskLevel(riskLevel);
		dto.setFraudReasons(fraudReasons);
		dto.setRelatedInvoices(relatedInvoices);
		dto.setVendorInfo(vendorInfo);
		dto.setTimeline(timeline);

		return dto;
	}

	// Levenshtein helper removed; similar logic exists in rule implementations
}
