package com.invoicefraud.dto;

import java.math.BigDecimal;
import java.util.List;

public class FraudDetectionResult {

	private BigDecimal fraudScore;
	private String riskCategory;
	private List<String> triggeredRules;

	public FraudDetectionResult() {
	}

	public FraudDetectionResult(BigDecimal fraudScore, String riskCategory, List<String> triggeredRules) {
		this.fraudScore = fraudScore;
		this.riskCategory = riskCategory;
		this.triggeredRules = triggeredRules;
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

	public List<String> getTriggeredRules() {
		return triggeredRules;
	}

	public void setTriggeredRules(List<String> triggeredRules) {
		this.triggeredRules = triggeredRules;
	}
}
