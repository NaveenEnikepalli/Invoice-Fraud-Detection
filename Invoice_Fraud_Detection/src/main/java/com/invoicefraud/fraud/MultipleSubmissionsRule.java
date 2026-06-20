package com.invoicefraud.fraud;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.stereotype.Component;
import com.invoicefraud.entity.Invoice;

@Component
public class MultipleSubmissionsRule implements FraudRule {

	@Override
	public String getName() {
		return "Multiple Submissions Within Short Time";
	}

	@Override
	public BigDecimal evaluate(Invoice invoice, List<Invoice> historicalInvoices) {
		if (invoice == null || invoice.getInvoiceDate() == null || historicalInvoices == null) {
			return BigDecimal.ZERO;
		}

		for (Invoice hist : historicalInvoices) {
			if (hist.getId() != null && hist.getId().equals(invoice.getId())) {
				continue;
			}
			if (hist.getInvoiceDate() != null) {
				long days = Math.abs(ChronoUnit.DAYS.between(invoice.getInvoiceDate(), hist.getInvoiceDate()));
				if (days <= 1) { // 1 day or same day
					return new BigDecimal("15.00");
				}
			}
		}

		return BigDecimal.ZERO;
	}
}
