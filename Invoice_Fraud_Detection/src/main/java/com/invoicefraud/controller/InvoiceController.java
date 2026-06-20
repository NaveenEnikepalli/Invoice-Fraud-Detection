package com.invoicefraud.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



import com.invoicefraud.dto.ApiResponse;
import com.invoicefraud.dto.FraudExplanationResponseDTO;
import com.invoicefraud.dto.InvoiceRequestDTO;
import com.invoicefraud.dto.InvoiceResponseDTO;
import com.invoicefraud.service.FraudExplanationService;
import com.invoicefraud.service.InvoiceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

	private final InvoiceService invoiceService;
	private final FraudExplanationService fraudExplanationService;

	public InvoiceController(InvoiceService invoiceService, FraudExplanationService fraudExplanationService) {
		this.invoiceService = invoiceService;
		this.fraudExplanationService = fraudExplanationService;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<InvoiceResponseDTO>> createInvoice(
			@Valid @RequestBody InvoiceRequestDTO requestDTO) {
		InvoiceResponseDTO invoice = invoiceService.createInvoice(requestDTO);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Invoice created successfully", invoice));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getAllInvoices() {
		List<InvoiceResponseDTO> invoices = invoiceService.getAllInvoices();
		return ResponseEntity.ok(ApiResponse.success("Invoices retrieved successfully", invoices));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<InvoiceResponseDTO>> getInvoiceById(@PathVariable Long id) {
		InvoiceResponseDTO invoice = invoiceService.getInvoiceById(id);
		return ResponseEntity.ok(ApiResponse.success("Invoice retrieved successfully", invoice));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<InvoiceResponseDTO>> updateInvoice(
			@PathVariable Long id,
			@Valid @RequestBody InvoiceRequestDTO requestDTO) {
		InvoiceResponseDTO invoice = invoiceService.updateInvoice(id, requestDTO);
		return ResponseEntity.ok(ApiResponse.success("Invoice updated successfully", invoice));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteInvoice(@PathVariable Long id) {
		invoiceService.deleteInvoice(id);
		return ResponseEntity.ok(ApiResponse.success("Invoice deleted successfully", null));
	}

	@GetMapping("/vendor/{vendorId}")
	public ResponseEntity<ApiResponse<List<InvoiceResponseDTO>>> getInvoicesByVendor(
			@PathVariable Long vendorId) {
		List<InvoiceResponseDTO> invoices = invoiceService.getInvoicesByVendor(vendorId);
		return ResponseEntity.ok(ApiResponse.success("Vendor invoices retrieved successfully", invoices));
	}

	@GetMapping("/{id}/explanation")
	public ResponseEntity<ApiResponse<FraudExplanationResponseDTO>> getFraudExplanation(
			@PathVariable Long id) {
		FraudExplanationResponseDTO explanation = fraudExplanationService.explainFraud(id);
		return ResponseEntity.ok(ApiResponse.success("Fraud explanation compiled successfully", explanation));
	}

	@PutMapping("/{id}/notes")
	public ResponseEntity<ApiResponse<InvoiceResponseDTO>> updateInvoiceNotes(
			@PathVariable Long id,
			@RequestBody java.util.Map<String, String> body) {
		String notes = body.get("notes");
		InvoiceResponseDTO invoice = invoiceService.updateInvoiceNotes(id, notes);
		return ResponseEntity.ok(ApiResponse.success("Invoice notes updated successfully", invoice));
	}
}
