package com.invoicefraud.fraud;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

import org.springframework.stereotype.Component;

import com.invoicefraud.entity.Invoice;

@Component
public class SuspiciousAmountRule implements FraudRule {

	@Override
	public String getName() {
		return "Unusually High Amount";
	}

	@Override
	public BigDecimal evaluate(Invoice invoice, List<Invoice> historicalInvoices) {
		if (invoice == null || invoice.getAmount() == null) {
			return BigDecimal.ZERO;
		}

		BigDecimal amount = invoice.getAmount();

		// Check absolute high threshold (> $50k)
		boolean isAbsoluteHigh = amount.compareTo(new BigDecimal("50000.00")) > 0;

		// Check comparative anomaly (> 3x historical average)
		boolean isComparativeHigh = false;
		if (historicalInvoices != null && !historicalInvoices.isEmpty()) {
			BigDecimal sum = BigDecimal.ZERO;
			int count = 0;
			for (Invoice hist : historicalInvoices) {
				if (hist.getId() != null && hist.getId().equals(invoice.getId())) {
					continue;
				}
				if (hist.getAmount() != null) {
					sum = sum.add(hist.getAmount());
					count++;
				}
			}

			if (count > 0) {
				BigDecimal avg = sum.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP);
				if (avg.compareTo(BigDecimal.ZERO) > 0) {
					BigDecimal ratio = amount.divide(avg, 2, RoundingMode.HALF_UP);
					if (ratio.compareTo(new BigDecimal("3.00")) > 0) {
						isComparativeHigh = true;
					}
				}
			}
		}

		if (isAbsoluteHigh || isComparativeHigh) {
			return new BigDecimal("25.00");
		}

		return BigDecimal.ZERO;
	}
}
