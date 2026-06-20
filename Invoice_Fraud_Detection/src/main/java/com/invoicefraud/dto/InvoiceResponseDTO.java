package com.invoicefraud.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.invoicefraud.enums.InvoiceStatus;

public class InvoiceResponseDTO {

	private Long id;
	private String invoiceNumber;
	private BigDecimal amount;
	private LocalDate invoiceDate;
	private BigDecimal fraudScore;
	private InvoiceStatus status;
	private Long vendorId;
	private String vendorName;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private String description;
	private String investigationNotes;

	public InvoiceResponseDTO() {
	}

	public InvoiceResponseDTO(Long id, String invoiceNumber, BigDecimal amount, LocalDate invoiceDate, BigDecimal fraudScore, InvoiceStatus status, Long vendorId, String vendorName, LocalDateTime createdAt, LocalDateTime updatedAt, String description, String investigationNotes) {
		this.id = id;
		this.invoiceNumber = invoiceNumber;
		this.amount = amount;
		this.invoiceDate = invoiceDate;
		this.fraudScore = fraudScore;
		this.status = status;
		this.vendorId = vendorId;
		this.vendorName = vendorName;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
		this.description = description;
		this.investigationNotes = investigationNotes;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
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

	public String getVendorName() {
		return vendorName;
	}

	public void setVendorName(String vendorName) {
		this.vendorName = vendorName;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getInvestigationNotes() {
		return investigationNotes;
	}

	public void setInvestigationNotes(String investigationNotes) {
		this.investigationNotes = investigationNotes;
	}
}
