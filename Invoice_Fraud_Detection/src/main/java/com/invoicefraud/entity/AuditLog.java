package com.invoicefraud.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "audit_logs")
public class AuditLog extends BaseEntity {

	@Column(name = "user_email", nullable = false)
	private String userEmail;

	@Column(nullable = false)
	private String action;

	@Column(name = "entity_name", nullable = false)
	private String entityName;

	@Column(name = "entity_id")
	private Long entityId;

	@Column(nullable = false, length = 1000)
	private String details;

	public AuditLog() {
		super();
	}

	public AuditLog(String userEmail, String action, String entityName, Long entityId, String details) {
		super();
		this.userEmail = userEmail;
		this.action = action;
		this.entityName = entityName;
		this.entityId = entityId;
		this.details = details;
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
}
