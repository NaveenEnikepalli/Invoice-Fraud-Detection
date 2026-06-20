package com.invoicefraud.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.invoicefraud.dto.AuditLogResponseDTO;
import com.invoicefraud.entity.AuditLog;
import com.invoicefraud.exception.ResourceNotFoundException;
import com.invoicefraud.mapper.AuditLogMapper;
import com.invoicefraud.repository.AuditLogRepository;

@Service
public class AuditLogService {

	private final AuditLogRepository auditLogRepository;
	private final AuditLogMapper auditLogMapper;
	private final CurrentUserService currentUserService;

	public AuditLogService(AuditLogRepository auditLogRepository, AuditLogMapper auditLogMapper, CurrentUserService currentUserService) {
		this.auditLogRepository = auditLogRepository;
		this.auditLogMapper = auditLogMapper;
		this.currentUserService = currentUserService;
	}

	@Transactional(readOnly = true)
	public List<AuditLogResponseDTO> getAllLogs() {
		return auditLogRepository.findByUserEmailOrderByCreatedAtDesc(currentUserService.getCurrentUserEmail())
				.stream()
				.map(auditLogMapper::toResponseDTO)
				.toList();
	}

	@Transactional(readOnly = true)
	public AuditLogResponseDTO getLogById(Long id) {
		AuditLog log = auditLogRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Audit log not found with id: " + id));
		if (!log.getUserEmail().equalsIgnoreCase(currentUserService.getCurrentUserEmail())) {
			throw new ResourceNotFoundException("Audit log not found with id: " + id);
		}
		return auditLogMapper.toResponseDTO(log);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void logAction(String action, String entityName, Long entityId, String details) {
		logAction(null, action, entityName, entityId, details);
	}

	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void logAction(String userEmail, String action, String entityName, Long entityId, String details) {
		String resolvedEmail = userEmail != null ? userEmail : getCurrentUserEmail();

		AuditLog log = new AuditLog();
		log.setUserEmail(resolvedEmail);
		log.setAction(action);
		log.setEntityName(entityName);
		log.setEntityId(entityId);
		log.setDetails(details);

		auditLogRepository.save(log);
	}

	private String getCurrentUserEmail() {
		try {
			org.springframework.web.context.request.ServletRequestAttributes attributes = 
				(org.springframework.web.context.request.ServletRequestAttributes) 
				org.springframework.web.context.request.RequestContextHolder.currentRequestAttributes();
			jakarta.servlet.http.HttpServletRequest request = attributes.getRequest();
			String email = request.getHeader("X-User-Email");
			if (email != null && !email.trim().isEmpty()) {
				return email;
			}
		} catch (Exception e) {
			// RequestContextHolder attributes might not be present if called outside request scope
		}
		return "SYSTEM";
	}
}
