package com.invoicefraud.dto;

public class RelatedInvoiceDTO {

	private Long invoiceId;
	private String invoiceNumber;
	private String vendorName;
	private java.math.BigDecimal amount;
	private java.time.LocalDate invoiceDate;

	public RelatedInvoiceDTO() {
	}

	public RelatedInvoiceDTO(Long invoiceId, String invoiceNumber) {
		this.invoiceId = invoiceId;
		this.invoiceNumber = invoiceNumber;
	}

	public RelatedInvoiceDTO(Long invoiceId, String invoiceNumber, String vendorName, java.math.BigDecimal amount, java.time.LocalDate invoiceDate) {
		this.invoiceId = invoiceId;
		this.invoiceNumber = invoiceNumber;
		this.vendorName = vendorName;
		this.amount = amount;
		this.invoiceDate = invoiceDate;
	}

	public Long getInvoiceId() {
		return invoiceId;
	}

	public void setInvoiceId(Long invoiceId) {
		this.invoiceId = invoiceId;
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

	public java.math.BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(java.math.BigDecimal amount) {
		this.amount = amount;
	}

	public java.time.LocalDate getInvoiceDate() {
		return invoiceDate;
	}

	public void setInvoiceDate(java.time.LocalDate invoiceDate) {
		this.invoiceDate = invoiceDate;
	}
}
