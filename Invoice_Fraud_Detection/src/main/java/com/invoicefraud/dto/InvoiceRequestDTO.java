package com.invoicefraud.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.invoicefraud.enums.InvoiceStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class InvoiceRequestDTO {

	@NotBlank(message = "Invoice number is required")
	@Size(max = 100, message = "Invoice number must not exceed 100 characters")
	private String invoiceNumber;

	@NotNull(message = "Amount is required")
	@Positive(message = "Amount must be positive")
	private BigDecimal amount;

	@NotNull(message = "Invoice date is required")
	private LocalDate invoiceDate;

	@PositiveOrZero(message = "Fraud score must be zero or positive")
	private BigDecimal fraudScore;

	@NotNull(message = "Status is required")
	private InvoiceStatus status;

	@NotNull(message = "Vendor id is required")
	@Positive(message = "Vendor id must be positive")
	private Long vendorId;

	private String description;

	public InvoiceRequestDTO() {
	}

	public InvoiceRequestDTO(String invoiceNumber, BigDecimal amount, LocalDate invoiceDate, BigDecimal fraudScore, InvoiceStatus status, Long vendorId, String description) {
		this.invoiceNumber = invoiceNumber;
		this.amount = amount;
		this.invoiceDate = invoiceDate;
		this.fraudScore = fraudScore;
		this.status = status;
		this.vendorId = vendorId;
		this.description = description;
	}

	public String getInvoiceNumber() {
		return invoiceNumber;
	}

	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
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

	public BigDecimal getFraudScore() {
		return fraudScore;
	}

	public void setFraudScore(BigDecimal fraudScore) {
		this.fraudScore = fraudScore;
	}

	public InvoiceStatus getStatus() {
		return status;
	}

	public void setStatus(InvoiceStatus status) {
		this.status = status;
	}

	public Long getVendorId() {
		return vendorId;
	}

	public void setVendorId(Long vendorId) {
		this.vendorId = vendorId;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	private Long documentId;

	public Long getDocumentId() {
		return documentId;
	}

	public void setDocumentId(Long documentId) {
		this.documentId = documentId;
	}
}
