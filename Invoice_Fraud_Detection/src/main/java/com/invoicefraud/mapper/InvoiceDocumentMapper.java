package com.invoicefraud.mapper;

import org.springframework.stereotype.Component;

import com.invoicefraud.dto.InvoiceDocumentResponseDTO;
import com.invoicefraud.entity.InvoiceDocument;

@Component
public class InvoiceDocumentMapper {

	public InvoiceDocumentResponseDTO toResponseDTO(InvoiceDocument doc) {
		if (doc == null) {
			return null;
		}

		InvoiceDocumentResponseDTO dto = new InvoiceDocumentResponseDTO();
		dto.setId(doc.getId());
		dto.setFileName(doc.getFileName());
		dto.setFileType(doc.getFileType());
		dto.setStoragePath(doc.getStoragePath());
		dto.setExtractedText(doc.getExtractedText());
		dto.setInvoiceId(doc.getInvoice() != null ? doc.getInvoice().getId() : null);
		dto.setCreatedAt(doc.getCreatedAt());
		dto.setUpdatedAt(doc.getUpdatedAt());
		return dto;
	}
}
