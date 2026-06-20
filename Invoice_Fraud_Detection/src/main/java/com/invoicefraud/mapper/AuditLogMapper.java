package com.invoicefraud.mapper;

import org.springframework.stereotype.Component;

import com.invoicefraud.dto.AuditLogResponseDTO;
import com.invoicefraud.entity.AuditLog;

@Component
public class AuditLogMapper {

	public AuditLogResponseDTO toResponseDTO(AuditLog log) {
		if (log == null) {
			return null;
		}

		AuditLogResponseDTO dto = new AuditLogResponseDTO();
		dto.setId(log.getId());
		dto.setUserEmail(log.getUserEmail());
		dto.setAction(log.getAction());
		dto.setEntityName(log.getEntityName());
		dto.setEntityId(log.getEntityId());
		dto.setDetails(log.getDetails());
		dto.setCreatedAt(log.getCreatedAt());
		return dto;
	}
}
