package com.invoicefraud.fraud;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Component;

import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.Vendor;

@Component
public class VendorRiskRule implements FraudRule {

	@Override
	public String getName() {
		return "Vendor Previously Flagged";
	}

	@Override
	public BigDecimal evaluate(Invoice invoice, List<Invoice> historicalInvoices) {
		if (invoice == null || invoice.getVendor() == null) {
			return BigDecimal.ZERO;
		}

		Vendor vendor = invoice.getVendor();
		if (vendor.getRiskScore() != null && vendor.getRiskScore().compareTo(new BigDecimal("30.00")) > 0) {
			return new BigDecimal("20.00");
		}

		return BigDecimal.ZERO;
	}
}
