package com.invoicefraud.controller;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.invoicefraud.dto.AnalyticsSummaryDTO;
import com.invoicefraud.dto.ApiResponse;
import com.invoicefraud.dto.VendorResponseDTO;
import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.mapper.VendorMapper;
import com.invoicefraud.repository.InvoiceRepository;
import com.invoicefraud.repository.VendorRepository;
import com.invoicefraud.service.CurrentUserService;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

	private final InvoiceRepository invoiceRepository;
	private final VendorRepository vendorRepository;
	private final VendorMapper vendorMapper;
	private final CurrentUserService currentUserService;

	public AnalyticsController(
			InvoiceRepository invoiceRepository,
			VendorRepository vendorRepository,
			VendorMapper vendorMapper,
			CurrentUserService currentUserService) {
		this.invoiceRepository = invoiceRepository;
		this.vendorRepository = vendorRepository;
		this.vendorMapper = vendorMapper;
		this.currentUserService = currentUserService;
	}

	@GetMapping("/summary")
	public ResponseEntity<ApiResponse<AnalyticsSummaryDTO>> getSummary() {
		String userEmail = currentUserService.getCurrentUserEmail();
		long totalInvoices = invoiceRepository.countByUserEmail(userEmail);
		long totalVendors = vendorRepository.countByUserEmail(userEmail);
		BigDecimal totalAmount = invoiceRepository.sumAllAmountsByUserEmail(userEmail);
		if (totalAmount == null) {
			totalAmount = BigDecimal.ZERO;
		}

		long flaggedInvoices = 0; // score > 30 (Medium and High)
		long detectedFraud = 0;   // score > 60 (High)
		BigDecimal savings = BigDecimal.ZERO;
		double sumScores = 0;
		long countScores = 0;

		List<Invoice> invoices = invoiceRepository.findAllByUserEmail(userEmail);
		for (Invoice inv : invoices) {
			BigDecimal score = inv.getFraudScore() != null ? inv.getFraudScore() : BigDecimal.ZERO;
			sumScores += score.doubleValue();
			countScores++;
			if (score.compareTo(new BigDecimal("30.00")) > 0) {
				flaggedInvoices++;
				savings = savings.add(inv.getAmount() != null ? inv.getAmount() : BigDecimal.ZERO);
			}
			if (score.compareTo(new BigDecimal("60.00")) > 0) {
				detectedFraud++;
			}
		}

		long highRiskVendors = 0;
		List<Vendor> vendors = vendorRepository.findAllByUserEmail(userEmail);
		for (Vendor v : vendors) {
			BigDecimal risk = v.getRiskScore() != null ? v.getRiskScore() : BigDecimal.ZERO;
			if (risk.compareTo(new BigDecimal("50.00")) >= 0) {
				highRiskVendors++;
			}
		}

		double avgRiskScore = countScores > 0 ? (sumScores / countScores) : 0.0;

		AnalyticsSummaryDTO summary = new AnalyticsSummaryDTO();
		summary.setTotalInvoices(totalInvoices);
		summary.setFlaggedInvoices(flaggedInvoices);
		summary.setHighRiskVendors(highRiskVendors);
		summary.setTotalAmount(totalAmount);
		summary.setDetectedFraud(detectedFraud);
		summary.setFraudSavingsEstimate(savings);
		summary.setAverageRiskScore(avgRiskScore);
		summary.setTotalVendors(totalVendors);

		return ResponseEntity.ok(ApiResponse.success("Analytics summary retrieved successfully", summary));
	}

	@GetMapping("/fraud-trends")
	public ResponseEntity<ApiResponse<Map<String, Long>>> getFraudTrends() {
		List<Invoice> invoices = invoiceRepository.findAllByUserEmail(currentUserService.getCurrentUserEmail());

		long low = 0;
		long medium = 0;
		long high = 0;

		for (Invoice inv : invoices) {
			BigDecimal score = inv.getFraudScore() != null ? inv.getFraudScore() : BigDecimal.ZERO;
			if (score.compareTo(new BigDecimal("30.00")) <= 0) {
				low++;
			} else if (score.compareTo(new BigDecimal("60.00")) <= 0) {
				medium++;
			} else {
				high++;
			}
		}

		Map<String, Long> trends = new LinkedHashMap<>();
		trends.put("Low", low);
		trends.put("Medium", medium);
		trends.put("High", high);

		return ResponseEntity.ok(ApiResponse.success("Fraud trends retrieved successfully", trends));
	}

	@GetMapping("/vendor-risk")
	public ResponseEntity<ApiResponse<List<VendorResponseDTO>>> getVendorRiskRanking() {
		List<Vendor> vendors = vendorRepository.findAllByUserEmail(currentUserService.getCurrentUserEmail());

		List<VendorResponseDTO> ranking = vendors.stream()
				.sorted((v1, v2) -> {
					BigDecimal r1 = v1.getRiskScore() != null ? v1.getRiskScore() : BigDecimal.ZERO;
					BigDecimal r2 = v2.getRiskScore() != null ? v2.getRiskScore() : BigDecimal.ZERO;
					return r2.compareTo(r1);
				})
				.map(vendorMapper::toResponseDTO)
				.toList();

		return ResponseEntity.ok(ApiResponse.success("Vendor risk ranking retrieved successfully", ranking));
	}
}
