package com.invoicefraud.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity
@Table(name = "vendors")
public class Vendor extends BaseEntity {

	@Column(name = "vendor_name", nullable = false, length = 150)
	private String vendorName;

	@Column(name = "vendor_email", length = 150)
	private String vendorEmail;

	@Column(name = "vendor_phone", length = 30)
	private String vendorPhone;

	@Column(name = "risk_score", precision = 5, scale = 2)
	private BigDecimal riskScore;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@JsonManagedReference
	@OneToMany(
			mappedBy = "vendor",
			cascade = CascadeType.ALL,
			orphanRemoval = true
	)
	private List<Invoice> invoices = new ArrayList<>();

	public Vendor() {
		super();
	}

	public Vendor(String vendorName, String vendorEmail, String vendorPhone, BigDecimal riskScore) {
		super();
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

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public List<Invoice> getInvoices() {
		return invoices;
	}

	public void setInvoices(List<Invoice> invoices) {
		this.invoices = invoices;
	}
}
