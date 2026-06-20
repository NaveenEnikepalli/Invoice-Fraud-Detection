package com.invoicefraud.fraud;

import java.math.BigDecimal;
import java.util.List;

import com.invoicefraud.entity.Invoice;
import org.springframework.stereotype.Component;

@Component
public class SimilarInvoiceNumberRule implements FraudRule {

	@Override
	public String getName() {
		return "Similar Invoice Number Detection";
	}

	@Override
	public BigDecimal evaluate(Invoice invoice, List<Invoice> historicalInvoices) {
		if (invoice == null || invoice.getInvoiceNumber() == null || historicalInvoices == null) {
			return BigDecimal.ZERO;
		}

		String target = invoice.getInvoiceNumber().trim();
		BigDecimal maxRisk = BigDecimal.ZERO;

		for (Invoice hist : historicalInvoices) {
			if (hist.getId() != null && hist.getId().equals(invoice.getId())) {
				continue;
			}

			String histNum = hist.getInvoiceNumber().trim();
			if (target.equalsIgnoreCase(histNum)) {
				continue; // Handled by exact duplicate rule
			}

			int distance = calculateLevenshteinDistance(target, histNum);
			int maxLength = Math.max(target.length(), histNum.length());

			if (maxLength > 0) {
				double similarity = (1.0 - (double) distance / maxLength) * 100.0;
				// If similarity is high, e.g. >= 80% and distance is small
				if (similarity >= 80.0 && distance <= 2) {
					BigDecimal risk = BigDecimal.valueOf(similarity);
					if (risk.compareTo(maxRisk) > 0) {
						maxRisk = risk;
					}
				}
			}
		}

		return maxRisk;
	}

	private int calculateLevenshteinDistance(String s1, String s2) {
		int[][] dp = new int[s1.length() + 1][s2.length() + 1];

		for (int i = 0; i <= s1.length(); i++) {
			for (int j = 0; j <= s2.length(); j++) {
				if (i == 0) {
					dp[i][j] = j;
				} else if (j == 0) {
					dp[i][j] = i;
				} else {
					int cost = (s1.toLowerCase().charAt(i - 1) == s2.toLowerCase().charAt(j - 1)) ? 0 : 1;
					dp[i][j] = Math.min(
							Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1),
							dp[i - 1][j - 1] + cost
					);
				}
			}
		}
		return dp[s1.length()][s2.length()];
	}
}
