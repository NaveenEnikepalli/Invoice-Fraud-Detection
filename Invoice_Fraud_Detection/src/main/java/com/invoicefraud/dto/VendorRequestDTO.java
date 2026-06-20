package com.invoicefraud.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public class VendorRequestDTO {

	@NotBlank(message = "Vendor name is required")
	@Size(max = 150, message = "Vendor name must not exceed 150 characters")
	private String vendorName;

	@Email(message = "Vendor email must be valid")
	@Size(max = 150, message = "Vendor email must not exceed 150 characters")
	private String vendorEmail;

	@Size(max = 30, message = "Vendor phone must not exceed 30 characters")
	private String vendorPhone;

	@PositiveOrZero(message = "Risk score must be zero or positive")
	private BigDecimal riskScore;

	public VendorRequestDTO() {
	}

	public VendorRequestDTO(String vendorName, String vendorEmail, String vendorPhone, BigDecimal riskScore) {
		this.vendorName = vendorName;
		this.vendorEmail = vendorEmail;
		this.vendorPhone = vendorPhone;
		this.riskScore = riskScore;
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
}
