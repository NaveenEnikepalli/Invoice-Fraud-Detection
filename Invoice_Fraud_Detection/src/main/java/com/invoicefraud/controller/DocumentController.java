package com.invoicefraud.controller;

import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.invoicefraud.dto.ApiResponse;
import com.invoicefraud.dto.ExtractedInvoiceDTO;
import com.invoicefraud.dto.InvoiceDocumentResponseDTO;
import com.invoicefraud.entity.InvoiceDocument;
import com.invoicefraud.mapper.InvoiceDocumentMapper;
import com.invoicefraud.repository.InvoiceDocumentRepository;
import com.invoicefraud.service.CurrentUserService;
import com.invoicefraud.service.DocumentStorageService;
import com.invoicefraud.service.OcrService;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

	private final DocumentStorageService storageService;
	private final OcrService ocrService;
	private final InvoiceDocumentRepository documentRepository;
	private final InvoiceDocumentMapper documentMapper;
	private final CurrentUserService currentUserService;

	public DocumentController(
			DocumentStorageService storageService,
			OcrService ocrService,
			InvoiceDocumentRepository documentRepository,
			InvoiceDocumentMapper documentMapper,
			CurrentUserService currentUserService) {
		this.storageService = storageService;
		this.ocrService = ocrService;
		this.documentRepository = documentRepository;
		this.documentMapper = documentMapper;
		this.currentUserService = currentUserService;
	}

	@PostMapping("/upload")
	public ResponseEntity<ApiResponse<ExtractedInvoiceDTO>> uploadDocument(
			@RequestParam("file") MultipartFile file) {
		if (file.isEmpty()) {
			return ResponseEntity.badRequest()
					.body(ApiResponse.failure("Uploaded file is empty", null));
		}

		String savedPath = storageService.storeFile(file);

		String extractedText = ocrService.extractText(savedPath);

		ExtractedInvoiceDTO extractedDTO = ocrService.parseExtractedText(extractedText);

		InvoiceDocument doc = new InvoiceDocument();
		doc.setFileName(file.getOriginalFilename());
		doc.setFileType(file.getContentType() != null ? file.getContentType() : "application/octet-stream");
		doc.setStoragePath(savedPath);
		doc.setExtractedText(extractedText);
		doc.setUser(currentUserService.getCurrentUser());

		InvoiceDocument savedDoc = documentRepository.save(doc);
		extractedDTO.setDocumentId(savedDoc.getId());

		return ResponseEntity.ok(
				ApiResponse.success("Document uploaded and parsed successfully", extractedDTO)
		);
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<InvoiceDocumentResponseDTO>>> getAllDocuments() {
		List<InvoiceDocumentResponseDTO> list = documentRepository.findAllByUserEmail(currentUserService.getCurrentUserEmail())
				.stream()
				.map(documentMapper::toResponseDTO)
				.toList();
		return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", list));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<InvoiceDocumentResponseDTO>> getDocumentById(@PathVariable Long id) {
		InvoiceDocument doc = documentRepository.findByIdAndUserEmail(id, currentUserService.getCurrentUserEmail())
				.orElseThrow(() -> new com.invoicefraud.exception.ResourceNotFoundException("Document not found with id: " + id));
		return ResponseEntity.ok(ApiResponse.success("Document retrieved successfully", documentMapper.toResponseDTO(doc)));
	}

	@GetMapping("/{id}/download")
	public ResponseEntity<?> downloadDocument(@PathVariable Long id) {
		InvoiceDocument doc = documentRepository.findByIdAndUserEmail(id, currentUserService.getCurrentUserEmail())
				.orElseThrow(() -> new com.invoicefraud.exception.ResourceNotFoundException("Document not found with id: " + id));

		org.springframework.core.io.Resource resource = storageService.loadFileAsResource(doc.getStoragePath());
		String contentType = doc.getFileType();

		return ResponseEntity.ok()
				.contentType(MediaType.parseMediaType(contentType))
				.header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + doc.getFileName() + "\"")
				.body(resource);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
		InvoiceDocument doc = documentRepository.findByIdAndUserEmail(id, currentUserService.getCurrentUserEmail())
				.orElseThrow(() -> new com.invoicefraud.exception.ResourceNotFoundException("Document not found with id: " + id));

		storageService.deleteFile(doc.getStoragePath());
		documentRepository.delete(doc);

		return ResponseEntity.ok(ApiResponse.success("Document deleted successfully", null));
	}
}
