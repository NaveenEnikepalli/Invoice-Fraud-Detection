package com.invoicefraud.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.invoicefraud.entity.AuditLog;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
	java.util.List<AuditLog> findByEntityNameAndEntityIdOrderByCreatedAtAsc(String entityName, Long entityId);

	java.util.List<AuditLog> findByUserEmailOrderByCreatedAtDesc(String userEmail);

	java.util.List<AuditLog> findByUserEmailAndEntityNameAndEntityIdOrderByCreatedAtAsc(String userEmail, String entityName, Long entityId);
}
