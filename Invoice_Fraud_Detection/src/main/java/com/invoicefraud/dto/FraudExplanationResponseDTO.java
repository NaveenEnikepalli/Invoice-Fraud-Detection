package com.invoicefraud.dto;

import java.math.BigDecimal;
import java.util.List;

public class FraudExplanationResponseDTO {

	private Long invoiceId;
	private String invoiceNumber;
	private BigDecimal fraudScore;
	private String riskCategory;
	private List<String> explanations;

	// Phase 4 compliant fields
	private Integer riskScore;
	private String fraudStatus;
	private List<String> reasons;

	private String vendorName;
	private String riskLevel;
	private List<String> fraudReasons;
	private List<RelatedInvoiceDTO> relatedInvoices;
	private VendorResponseDTO vendorInfo;
	private List<AuditLogResponseDTO> timeline;

	public FraudExplanationResponseDTO() {
	}

	public FraudExplanationResponseDTO(Long invoiceId, String invoiceNumber, BigDecimal fraudScore, String riskCategory, List<String> explanations, Integer riskScore, String fraudStatus, List<String> reasons, String vendorName, String riskLevel, List<String> fraudReasons, List<RelatedInvoiceDTO> relatedInvoices) {
		this.invoiceId = invoiceId;
		this.invoiceNumber = invoiceNumber;
		this.fraudScore = fraudScore;
		this.riskCategory = riskCategory;
		this.explanations = explanations;
		this.riskScore = riskScore;
		this.fraudStatus = fraudStatus;
		this.reasons = reasons;
		this.vendorName = vendorName;
		this.riskLevel = riskLevel;
		this.fraudReasons = fraudReasons;
		this.relatedInvoices = relatedInvoices;
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

	public BigDecimal getFraudScore() {
		return fraudScore;
	}

	public void setFraudScore(BigDecimal fraudScore) {
		this.fraudScore = fraudScore;
	}

	public String getRiskCategory() {
		return riskCategory;
	}

	public void setRiskCategory(String riskCategory) {
		this.riskCategory = riskCategory;
	}

	public List<String> getExplanations() {
		return explanations;
	}

	public void setExplanations(List<String> explanations) {
		this.explanations = explanations;
	}

	public Integer getRiskScore() {
		return riskScore;
	}

	public void setRiskScore(Integer riskScore) {
		this.riskScore = riskScore;
	}

	public String getFraudStatus() {
		return fraudStatus;
	}

	public void setFraudStatus(String fraudStatus) {
		this.fraudStatus = fraudStatus;
	}

	public List<String> getReasons() {
		return reasons;
	}

	public void setReasons(List<String> reasons) {
		this.reasons = reasons;
	}

	public String getVendorName() {
		return vendorName;
	}

	public void setVendorName(String vendorName) {
		this.vendorName = vendorName;
	}

	public String getRiskLevel() {
		return riskLevel;
	}

	public void setRiskLevel(String riskLevel) {
		this.riskLevel = riskLevel;
	}

	public List<String> getFraudReasons() {
		return fraudReasons;
	}

	public void setFraudReasons(List<String> fraudReasons) {
		this.fraudReasons = fraudReasons;
	}

	public List<RelatedInvoiceDTO> getRelatedInvoices() {
		return relatedInvoices;
	}

	public void setRelatedInvoices(List<RelatedInvoiceDTO> relatedInvoices) {
		this.relatedInvoices = relatedInvoices;
	}

	public VendorResponseDTO getVendorInfo() {
		return vendorInfo;
	}

	public void setVendorInfo(VendorResponseDTO vendorInfo) {
		this.vendorInfo = vendorInfo;
	}

	public List<AuditLogResponseDTO> getTimeline() {
		return timeline;
	}

	public void setTimeline(List<AuditLogResponseDTO> timeline) {
		this.timeline = timeline;
	}
}
