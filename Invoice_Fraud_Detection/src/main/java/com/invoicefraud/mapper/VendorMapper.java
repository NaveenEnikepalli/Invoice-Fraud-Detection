package com.invoicefraud.mapper;

import org.springframework.stereotype.Component;

import com.invoicefraud.dto.VendorRequestDTO;
import com.invoicefraud.dto.VendorResponseDTO;
import com.invoicefraud.entity.Vendor;

@Component
public class VendorMapper {

	public Vendor toEntity(VendorRequestDTO requestDTO) {
		if (requestDTO == null) {
			return null;
		}

		Vendor vendor = new Vendor();
		vendor.setVendorName(requestDTO.getVendorName());
		vendor.setVendorEmail(requestDTO.getVendorEmail());
		vendor.setVendorPhone(requestDTO.getVendorPhone());
		vendor.setRiskScore(requestDTO.getRiskScore());
		return vendor;
	}

	public VendorResponseDTO toResponseDTO(Vendor vendor) {
		if (vendor == null) {
			return null;
		}

		VendorResponseDTO dto = new VendorResponseDTO();
		dto.setId(vendor.getId());
		dto.setVendorName(vendor.getVendorName());
		dto.setVendorEmail(vendor.getVendorEmail());
		dto.setVendorPhone(vendor.getVendorPhone());
		dto.setRiskScore(vendor.getRiskScore());
		dto.setCreatedAt(vendor.getCreatedAt());
		dto.setUpdatedAt(vendor.getUpdatedAt());
		return dto;
	}
}
