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
import com.invoicefraud.dto.VendorRequestDTO;
import com.invoicefraud.dto.VendorResponseDTO;
import com.invoicefraud.service.VendorService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vendors")
public class VendorController {

	private final VendorService vendorService;

	public VendorController(VendorService vendorService) {
		this.vendorService = vendorService;
	}

	@PostMapping
	public ResponseEntity<ApiResponse<VendorResponseDTO>> createVendor(
			@Valid @RequestBody VendorRequestDTO requestDTO) {
		VendorResponseDTO vendor = vendorService.createVendor(requestDTO);
		return ResponseEntity.status(HttpStatus.CREATED)
				.body(ApiResponse.success("Vendor created successfully", vendor));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<VendorResponseDTO>>> getAllVendors() {
		List<VendorResponseDTO> vendors = vendorService.getAllVendors();
		return ResponseEntity.ok(ApiResponse.success("Vendors retrieved successfully", vendors));
	}

	@GetMapping("/{id}")
	public ResponseEntity<ApiResponse<VendorResponseDTO>> getVendorById(@PathVariable Long id) {
		VendorResponseDTO vendor = vendorService.getVendorById(id);
		return ResponseEntity.ok(ApiResponse.success("Vendor retrieved successfully", vendor));
	}

	@PutMapping("/{id}")
	public ResponseEntity<ApiResponse<VendorResponseDTO>> updateVendor(
			@PathVariable Long id,
			@Valid @RequestBody VendorRequestDTO requestDTO) {
		VendorResponseDTO vendor = vendorService.updateVendor(id, requestDTO);
		return ResponseEntity.ok(ApiResponse.success("Vendor updated successfully", vendor));
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteVendor(@PathVariable Long id) {
		vendorService.deleteVendor(id);
		return ResponseEntity.ok(ApiResponse.success("Vendor deleted successfully", null));
	}
}
