package com.invoicefraud.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class VendorResponseDTO {

	private Long id;
	private String vendorName;
	private String vendorEmail;
	private String vendorPhone;
	private BigDecimal riskScore;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
	private long totalInvoices;
	private long totalFlaggedInvoices;

	public VendorResponseDTO() {
	}

	public VendorResponseDTO(Long id, String vendorName, String vendorEmail, String vendorPhone, BigDecimal riskScore, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.vendorName = vendorName;
		this.vendorEmail = vendorEmail;
		this.vendorPhone = vendorPhone;
		this.riskScore = riskScore;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
 	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getVendorName() {
		return vendorName;
	}

	public void setVendorName(String vendorName) {
		this.vendorName = vendorName;
	}

	public String getVendorEmail() {
		return vendorEmail;
	}

	public void setVendorEmail(String vendorEmail) {
		this.vendorEmail = vendorEmail;
	}

	public String getVendorPhone() {
		return vendorPhone;
	}

	public void setVendorPhone(String vendorPhone) {
		this.vendorPhone = vendorPhone;
	}

	public BigDecimal getRiskScore() {
		return riskScore;
	}

	public void setRiskScore(BigDecimal riskScore) {
		this.riskScore = riskScore;
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

	public long getTotalInvoices() {
		return totalInvoices;
	}

	public void setTotalInvoices(long totalInvoices) {
		this.totalInvoices = totalInvoices;
	}

	public long getTotalFlaggedInvoices() {
		return totalFlaggedInvoices;
	}

	public void setTotalFlaggedInvoices(long totalFlaggedInvoices) {
		this.totalFlaggedInvoices = totalFlaggedInvoices;
	}
}
