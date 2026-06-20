package com.invoicefraud.fraud;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Component;

import com.invoicefraud.entity.Invoice;

@Component
public class DuplicateInvoiceRule implements FraudRule {

	@Override
	public String getName() {
		return "Duplicate Invoice Number";
	}

	@Override
	public BigDecimal evaluate(Invoice invoice, List<Invoice> historicalInvoices) {
		if (invoice == null || invoice.getInvoiceNumber() == null || historicalInvoices == null) {
			return BigDecimal.ZERO;
		}

		String targetNumber = invoice.getInvoiceNumber().trim();

		for (Invoice hist : historicalInvoices) {
			// Skip comparing with itself if updating
			if (hist.getId() != null && hist.getId().equals(invoice.getId())) {
				continue;
			}
			if (targetNumber.equalsIgnoreCase(hist.getInvoiceNumber().trim())) {
				return new BigDecimal("40.00");
			}
		}

		return BigDecimal.ZERO;
	}
}
