package com.invoicefraud.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.invoicefraud.dto.FraudDetectionResult;
import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.fraud.FraudRule;
import com.invoicefraud.repository.VendorRepository;

@Service
public class FraudDetectionService {

	private final List<FraudRule> rules;
	private final VendorRepository vendorRepository;

	public FraudDetectionService(List<FraudRule> rules, VendorRepository vendorRepository) {
		this.rules = rules;
		this.vendorRepository = vendorRepository;
	}

	public FraudDetectionResult detectFraud(Invoice invoice, List<Invoice> historicalInvoices) {
		BigDecimal totalScore = BigDecimal.ZERO;
		List<String> triggeredRules = new ArrayList<>();

		for (FraudRule rule : rules) {
			BigDecimal score = rule.evaluate(invoice, historicalInvoices);
			if (score.compareTo(BigDecimal.ZERO) > 0) {
				totalScore = totalScore.add(score);
				triggeredRules.add(rule.getName() + " (Score: " + score.setScale(2, RoundingMode.HALF_UP) + ")");
			}
		}

		// Cap score at 100
		if (totalScore.compareTo(new BigDecimal("100.00")) > 0) {
			totalScore = new BigDecimal("100.00");
		}

		String riskCategory = getRiskCategory(totalScore);

		FraudDetectionResult result = new FraudDetectionResult();
		result.setFraudScore(totalScore.setScale(2, RoundingMode.HALF_UP));
		result.setRiskCategory(riskCategory);
		result.setTriggeredRules(triggeredRules);
		return result;
	}

	public FraudDetectionResult explainStoredFraud(Invoice invoice, List<Invoice> historicalInvoices, BigDecimal storedScore) {
		FraudDetectionResult detected = detectFraud(invoice, historicalInvoices);
		BigDecimal score = storedScore != null ? storedScore : BigDecimal.ZERO;
		detected.setFraudScore(score.setScale(2, RoundingMode.HALF_UP));
		detected.setRiskCategory(getRiskCategory(detected.getFraudScore()));
		return detected;
	}

	@Transactional
	public void updateVendorRiskScore(Vendor vendor, List<Invoice> vendorInvoices) {
		if (vendor == null) {
			return;
		}

		if (vendorInvoices == null || vendorInvoices.isEmpty()) {
			vendor.setRiskScore(BigDecimal.ZERO);
			vendorRepository.save(vendor);
			return;
		}

		BigDecimal sumScores = BigDecimal.ZERO;
		int count = 0;

		for (Invoice inv : vendorInvoices) {
			if (inv.getFraudScore() != null) {
				sumScores = sumScores.add(inv.getFraudScore());
				count++;
			}
		}

		BigDecimal newRiskScore = BigDecimal.ZERO;
		if (count > 0) {
			newRiskScore = sumScores.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
		}

		// Capping at 100
		if (newRiskScore.compareTo(new BigDecimal("100.00")) > 0) {
			newRiskScore = new BigDecimal("100.00");
		}

		vendor.setRiskScore(newRiskScore);
		vendorRepository.save(vendor);
	}

	private String getRiskCategory(BigDecimal score) {
		if (score.compareTo(new BigDecimal("30.00")) <= 0) {
			return "Low";
		} else if (score.compareTo(new BigDecimal("60.00")) <= 0) {
			return "Medium";
		} else {
			return "High";
		}
	}
}
