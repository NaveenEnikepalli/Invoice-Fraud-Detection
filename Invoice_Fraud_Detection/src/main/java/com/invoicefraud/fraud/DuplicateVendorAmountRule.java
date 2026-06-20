package com.invoicefraud.fraud;

import java.math.BigDecimal;
import java.util.List;
import org.springframework.stereotype.Component;
import com.invoicefraud.entity.Invoice;

@Component
public class DuplicateVendorAmountRule implements FraudRule {

	@Override
	public String getName() {
		return "Duplicate Vendor and Amount";
	}

	@Override
	public BigDecimal evaluate(Invoice invoice, List<Invoice> historicalInvoices) {
		if (invoice == null || invoice.getAmount() == null || invoice.getVendor() == null || historicalInvoices == null) {
			return BigDecimal.ZERO;
		}

		BigDecimal targetAmount = invoice.getAmount();
		Long targetVendorId = invoice.getVendor().getId();

		for (Invoice hist : historicalInvoices) {
			if (hist.getId() != null && hist.getId().equals(invoice.getId())) {
				continue;
			}
			if (hist.getVendor() != null && targetVendorId.equals(hist.getVendor().getId()) &&
				hist.getAmount() != null && targetAmount.compareTo(hist.getAmount()) == 0) {
				return new BigDecimal("30.00");
			}
		}

		return BigDecimal.ZERO;
	}
}
