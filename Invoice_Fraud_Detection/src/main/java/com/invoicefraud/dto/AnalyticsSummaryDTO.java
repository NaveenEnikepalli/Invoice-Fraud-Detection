package com.invoicefraud.dto;

import java.math.BigDecimal;

public class AnalyticsSummaryDTO {

	private long totalInvoices;
	private long flaggedInvoices;
	private long highRiskVendors;
	private BigDecimal totalAmount;
	private long detectedFraud;
	private BigDecimal fraudSavingsEstimate;
	private double averageRiskScore;
	private long totalVendors;

	public AnalyticsSummaryDTO() {
	}

	public AnalyticsSummaryDTO(long totalInvoices, long flaggedInvoices, long highRiskVendors, BigDecimal totalAmount, long detectedFraud, BigDecimal fraudSavingsEstimate, double averageRiskScore, long totalVendors) {
		this.totalInvoices = totalInvoices;
		this.flaggedInvoices = flaggedInvoices;
		this.highRiskVendors = highRiskVendors;
		this.totalAmount = totalAmount;
		this.detectedFraud = detectedFraud;
		this.fraudSavingsEstimate = fraudSavingsEstimate;
		this.averageRiskScore = averageRiskScore;
		this.totalVendors = totalVendors;
	}

	public long getTotalInvoices() {
		return totalInvoices;
	}

	public void setTotalInvoices(long totalInvoices) {
		this.totalInvoices = totalInvoices;
	}

	public long getFlaggedInvoices() {
		return flaggedInvoices;
	}

	public void setFlaggedInvoices(long flaggedInvoices) {
		this.flaggedInvoices = flaggedInvoices;
	}

	public long getHighRiskVendors() {
		return highRiskVendors;
	}

	public void setHighRiskVendors(long highRiskVendors) {
		this.highRiskVendors = highRiskVendors;
	}

	public BigDecimal getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(BigDecimal totalAmount) {
		this.totalAmount = totalAmount;
	}

	public long getDetectedFraud() {
		return detectedFraud;
	}

	public void setDetectedFraud(long detectedFraud) {
		this.detectedFraud = detectedFraud;
	}

	public BigDecimal getFraudSavingsEstimate() {
		return fraudSavingsEstimate;
	}

	public void setFraudSavingsEstimate(BigDecimal fraudSavingsEstimate) {
		this.fraudSavingsEstimate = fraudSavingsEstimate;
	}

	public double getAverageRiskScore() {
		return averageRiskScore;
	}

	public void setAverageRiskScore(double averageRiskScore) {
		this.averageRiskScore = averageRiskScore;
	}

	public long getTotalVendors() {
		return totalVendors;
	}

	public void setTotalVendors(long totalVendors) {
		this.totalVendors = totalVendors;
	}
}
