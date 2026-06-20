package com.invoicefraud.service;

import java.util.List;

import com.invoicefraud.dto.VendorRequestDTO;
import com.invoicefraud.dto.VendorResponseDTO;

public interface VendorService {

	VendorResponseDTO createVendor(VendorRequestDTO requestDTO);

	VendorResponseDTO getVendorById(Long id);

	List<VendorResponseDTO> getAllVendors();

	VendorResponseDTO updateVendor(Long id, VendorRequestDTO requestDTO);

	void deleteVendor(Long id);
}
