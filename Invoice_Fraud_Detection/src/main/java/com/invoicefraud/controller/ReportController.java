package com.invoicefraud.controller;

import java.io.IOException;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.repository.InvoiceRepository;
import com.invoicefraud.repository.VendorRepository;
import com.invoicefraud.service.CurrentUserService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

	private final InvoiceRepository invoiceRepository;
	private final VendorRepository vendorRepository;
	private final CurrentUserService currentUserService;

	public ReportController(InvoiceRepository invoiceRepository, VendorRepository vendorRepository, CurrentUserService currentUserService) {
		this.invoiceRepository = invoiceRepository;
		this.vendorRepository = vendorRepository;
		this.currentUserService = currentUserService;
	}

	@GetMapping("/fraud/csv")
	public void exportFraudCsv(HttpServletResponse response) throws IOException {
		response.setContentType("text/csv");
		response.setHeader("Content-Disposition", "attachment; filename=\"fraud_report.csv\"");

		List<Invoice> invoices = invoiceRepository.findAllByUserEmail(currentUserService.getCurrentUserEmail());
		PrintWriter writer = response.getWriter();
		writer.println("Invoice Number,Vendor Name,Amount,Fraud Score,Risk Level,Status,Invoice Date");

		for (Invoice inv : invoices) {
			BigDecimal score = inv.getFraudScore() != null ? inv.getFraudScore() : BigDecimal.ZERO;
			if (score.compareTo(new BigDecimal("30.00")) > 0) {
				String riskLevel = "MEDIUM";
				if (score.compareTo(new BigDecimal("60.00")) > 0) {
					riskLevel = "HIGH";
				}
				writer.printf("%s,%s,%s,%s%%,%s,%s,%s\n",
						escapeCsv(inv.getInvoiceNumber()),
						escapeCsv(inv.getVendor() != null ? inv.getVendor().getVendorName() : "N/A"),
						inv.getAmount(),
						score.setScale(0, RoundingMode.HALF_UP),
						riskLevel,
						inv.getStatus(),
						inv.getInvoiceDate()
				);
			}
		}
	}

	@GetMapping("/vendor-risk/csv")
	public void exportVendorRiskCsv(HttpServletResponse response) throws IOException {
		response.setContentType("text/csv");
		response.setHeader("Content-Disposition", "attachment; filename=\"vendor_risk_report.csv\"");

		String userEmail = currentUserService.getCurrentUserEmail();
		List<Vendor> vendors = vendorRepository.findAllByUserEmail(userEmail);
		PrintWriter writer = response.getWriter();
		writer.println("Vendor Name,Email,Phone,Risk Score,Risk Level,Total Invoices,Total Flagged Invoices");

		for (Vendor v : vendors) {
			BigDecimal score = v.getRiskScore() != null ? v.getRiskScore() : BigDecimal.ZERO;
			String riskLevel = "LOW";
			if (score.compareTo(new BigDecimal("60.00")) > 0) {
				riskLevel = "HIGH";
			} else if (score.compareTo(new BigDecimal("30.00")) > 0) {
				riskLevel = "MEDIUM";
			}

			long totalInvoices = invoiceRepository.countByVendorIdAndUserEmail(v.getId(), userEmail);
			long totalFlaggedInvoices = invoiceRepository.countByVendorIdAndUserEmailAndFraudScoreGreaterThan(v.getId(), userEmail, new BigDecimal("30.00"));

			writer.printf("%s,%s,%s,%s%%,%s,%d,%d\n",
					escapeCsv(v.getVendorName()),
					escapeCsv(v.getVendorEmail() != null ? v.getVendorEmail() : "N/A"),
					escapeCsv(v.getVendorPhone() != null ? v.getVendorPhone() : "N/A"),
					score.setScale(0, RoundingMode.HALF_UP),
					riskLevel,
					totalInvoices,
					totalFlaggedInvoices
			);
		}
	}

	@GetMapping("/invoice-summary/csv")
	public void exportInvoiceSummaryCsv(HttpServletResponse response) throws IOException {
		response.setContentType("text/csv");
		response.setHeader("Content-Disposition", "attachment; filename=\"invoice_summary_report.csv\"");

		List<Invoice> invoices = invoiceRepository.findAllByUserEmail(currentUserService.getCurrentUserEmail());
		PrintWriter writer = response.getWriter();
		writer.println("Invoice Number,Vendor Name,Amount,Status,Fraud Score,Risk Level,Invoice Date");

		for (Invoice inv : invoices) {
			BigDecimal score = inv.getFraudScore() != null ? inv.getFraudScore() : BigDecimal.ZERO;
			String riskLevel = "LOW";
			if (score.compareTo(new BigDecimal("60.00")) > 0) {
				riskLevel = "HIGH";
			} else if (score.compareTo(new BigDecimal("30.00")) > 0) {
				riskLevel = "MEDIUM";
			}

			writer.printf("%s,%s,%s,%s,%s%%,%s,%s\n",
					escapeCsv(inv.getInvoiceNumber()),
					escapeCsv(inv.getVendor() != null ? inv.getVendor().getVendorName() : "N/A"),
					inv.getAmount(),
					inv.getStatus(),
					score.setScale(0, RoundingMode.HALF_UP),
					riskLevel,
					inv.getInvoiceDate()
			);
		}
	}

	@GetMapping("/monthly-fraud/csv")
	public void exportMonthlyFraudCsv(HttpServletResponse response) throws IOException {
		response.setContentType("text/csv");
		response.setHeader("Content-Disposition", "attachment; filename=\"monthly_fraud_report.csv\"");

		List<Invoice> invoices = invoiceRepository.findAllByUserEmail(currentUserService.getCurrentUserEmail());

		// Group by Year-Month
		Map<String, List<Invoice>> grouped = invoices.stream()
				.filter(i -> i.getInvoiceDate() != null)
				.collect(Collectors.groupingBy(i -> {
					LocalDate d = i.getInvoiceDate();
					return d.getYear() + "-" + String.format("%02d", d.getMonthValue());
				}));

		PrintWriter writer = response.getWriter();
		writer.println("Month,Total Invoices,Total Flagged Invoices,Average Fraud Score,Total Fraud Amount");

		List<String> sortedMonths = new ArrayList<>(grouped.keySet());
		Collections.sort(sortedMonths, Collections.reverseOrder());

		for (String month : sortedMonths) {
			List<Invoice> monthInvoices = grouped.get(month);
			long totalInvoices = monthInvoices.size();

			long flaggedInvoices = 0;
			BigDecimal sumFraudScores = BigDecimal.ZERO;
			BigDecimal totalFraudAmount = BigDecimal.ZERO;

			for (Invoice inv : monthInvoices) {
				BigDecimal score = inv.getFraudScore() != null ? inv.getFraudScore() : BigDecimal.ZERO;
				sumFraudScores = sumFraudScores.add(score);
				if (score.compareTo(new BigDecimal("30.00")) > 0) {
					flaggedInvoices++;
					totalFraudAmount = totalFraudAmount.add(inv.getAmount() != null ? inv.getAmount() : BigDecimal.ZERO);
				}
			}

			BigDecimal avgScore = totalInvoices > 0 ?
					sumFraudScores.divide(BigDecimal.valueOf(totalInvoices), 2, RoundingMode.HALF_UP) : BigDecimal.ZERO;

			writer.printf("%s,%d,%d,%s%%,%s\n",
					month,
					totalInvoices,
					flaggedInvoices,
					avgScore.setScale(0, RoundingMode.HALF_UP),
					totalFraudAmount
			);
		}
	}

	private String escapeCsv(String value) {
		if (value == null) {
			return "";
		}
		if (value.contains(",") || value.contains("\"") || value.contains("\n") || value.contains("\r")) {
			return "\"" + value.replace("\"", "\"\"") + "\"";
		}
		return value;
	}
}
