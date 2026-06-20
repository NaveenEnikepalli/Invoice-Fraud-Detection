package com.invoicefraud.dto;

import java.time.LocalDateTime;

public class AuditLogResponseDTO {

	private Long id;
	private String userEmail;
	private String action;
	private String entityName;
	private Long entityId;
	private String details;
	private LocalDateTime createdAt;

	public AuditLogResponseDTO() {
	}

	public AuditLogResponseDTO(Long id, String userEmail, String action, String entityName, Long entityId, String details, LocalDateTime createdAt) {
		this.id = id;
		this.userEmail = userEmail;
		this.action = action;
		this.entityName = entityName;
		this.entityId = entityId;
		this.details = details;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getUserEmail() {
		return userEmail;
	}

	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}

	public String getAction() {
		return action;
	}

	public void setAction(String action) {
		this.action = action;
	}

	public String getEntityName() {
		return entityName;
	}

	public void setEntityName(String entityName) {
		this.entityName = entityName;
	}

	public Long getEntityId() {
		return entityId;
	}

	public void setEntityId(Long entityId) {
		this.entityId = entityId;
	}

	public String getDetails() {
		return details;
	}

	public void setDetails(String details) {
		this.details = details;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
