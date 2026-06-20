package com.invoicefraud.entity;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.invoicefraud.enums.InvoiceStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "invoices",
		uniqueConstraints = {
				@UniqueConstraint(name = "uk_invoices_user_invoice_number", columnNames = { "user_id", "invoice_number" })
		}
)
public class Invoice extends BaseEntity {

	@Column(name = "invoice_number", nullable = false, length = 100)
	private String invoiceNumber;

	@Column(nullable = false, precision = 15, scale = 2)
	private BigDecimal amount;

	@Column(name = "invoice_date", nullable = false)
	private LocalDate invoiceDate;

	@Column(name = "fraud_score", precision = 5, scale = 2)
	private BigDecimal fraudScore;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 30)
	private InvoiceStatus status;

	@JsonBackReference
	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "vendor_id", nullable = false)
	private Vendor vendor;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "description", length = 255)
	private String description;

	@Column(name = "investigation_notes", columnDefinition = "TEXT")
	private String investigationNotes;

	public Invoice() {
		super();
	}

	public Invoice(String invoiceNumber, BigDecimal amount, LocalDate invoiceDate, BigDecimal fraudScore, InvoiceStatus status, Vendor vendor, String description) {
		super();
		this.invoiceNumber = invoiceNumber;
		this.amount = amount;
		this.invoiceDate = invoiceDate;
		this.fraudScore = fraudScore;
		this.status = status;
		this.vendor = vendor;
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

	public Vendor getVendor() {
		return vendor;
	}

	public void setVendor(Vendor vendor) {
		this.vendor = vendor;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
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
