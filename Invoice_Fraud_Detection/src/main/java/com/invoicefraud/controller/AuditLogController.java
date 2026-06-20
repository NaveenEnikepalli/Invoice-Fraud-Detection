package com.invoicefraud.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.invoicefraud.dto.ApiResponse;
import com.invoicefraud.dto.AuditLogResponseDTO;
import com.invoicefraud.service.AuditLogService;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

	private final AuditLogService auditLogService;

	public AuditLogController(AuditLogService auditLogService) {
		this.auditLogService = auditLogService;
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<AuditLogResponseDTO>>> getAllLogs() {
		List<AuditLogResponseDTO> logs = auditLogService.getAllLogs();
		return ResponseEntity.ok(ApiResponse.success("Audit logs retrieved successfully", logs));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<AuditLogResponseDTO>> getLogById(@PathVariable Long id) {
		AuditLogResponseDTO log = auditLogService.getLogById(id);
		return ResponseEntity.ok(ApiResponse.success("Audit log retrieved successfully", log));
	}
}
