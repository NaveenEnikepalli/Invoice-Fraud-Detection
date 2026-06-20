package com.invoicefraud.dto;

import java.time.LocalDateTime;

public class InvoiceDocumentResponseDTO {

	private Long id;
	private String fileName;
	private String fileType;
	private String storagePath;
	private String extractedText;
	private Long invoiceId;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;

	public InvoiceDocumentResponseDTO() {
	}

	public InvoiceDocumentResponseDTO(Long id, String fileName, String fileType, String storagePath, String extractedText, Long invoiceId, LocalDateTime createdAt, LocalDateTime updatedAt) {
		this.id = id;
		this.fileName = fileName;
		this.fileType = fileType;
		this.storagePath = storagePath;
		this.extractedText = extractedText;
		this.invoiceId = invoiceId;
		this.createdAt = createdAt;
		this.updatedAt = updatedAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getFileName() {
		return fileName;
	}

	public void setFileName(String fileName) {
		this.fileName = fileName;
	}

	public String getFileType() {
		return fileType;
	}

	public void setFileType(String fileType) {
		this.fileType = fileType;
	}

	public String getStoragePath() {
		return storagePath;
	}

	public void setStoragePath(String storagePath) {
		this.storagePath = storagePath;
	}

	public String getExtractedText() {
		return extractedText;
	}

	public void setExtractedText(String extractedText) {
		this.extractedText = extractedText;
	}

	public Long getInvoiceId() {
		return invoiceId;
	}

	public void setInvoiceId(Long invoiceId) {
		this.invoiceId = invoiceId;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}

	public void setUpdatedAt(LocalDateTime updatedAt) {
		this.updatedAt = updatedAt;
	}
}
