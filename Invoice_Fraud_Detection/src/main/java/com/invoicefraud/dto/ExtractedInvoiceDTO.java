package com.invoicefraud.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ExtractedInvoiceDTO {

	private String invoiceNumber;
	private String vendorName;
	private BigDecimal amount;
	private LocalDate invoiceDate;
	private String rawText;
	private Long documentId;

	public ExtractedInvoiceDTO() {
	}

	public ExtractedInvoiceDTO(String invoiceNumber, String vendorName, BigDecimal amount, LocalDate invoiceDate, String rawText, Long documentId) {
		this.invoiceNumber = invoiceNumber;
		this.vendorName = vendorName;
		this.amount = amount;
		this.invoiceDate = invoiceDate;
		this.rawText = rawText;
		this.documentId = documentId;
	}

	public String getInvoiceNumber() {
		return invoiceNumber;
	}

	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
	}

	public String getVendorName() {
		return vendorName;
	}

	public void setVendorName(String vendorName) {
		this.vendorName = vendorName;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public LocalDate getInvoiceDate() {
		return invoiceDate;
	}

	public void setInvoiceDate(LocalDate invoiceDate) {
		this.invoiceDate = invoiceDate;
	}

	public String getRawText() {
		return rawText;
	}

	public void setRawText(String rawText) {
		this.rawText = rawText;
	}

	public Long getDocumentId() {
		return documentId;
	}

	public void setDocumentId(Long documentId) {
		this.documentId = documentId;
	}
}
