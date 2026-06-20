package com.invoicefraud.fraud;

import java.math.BigDecimal;
import java.util.List;

import com.invoicefraud.entity.Invoice;

public interface FraudRule {

	String getName();

	BigDecimal evaluate(Invoice invoice, List<Invoice> historicalInvoices);
}
