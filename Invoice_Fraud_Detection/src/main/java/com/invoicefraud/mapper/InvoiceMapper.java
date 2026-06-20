package com.invoicefraud.mapper;

import org.springframework.stereotype.Component;

import com.invoicefraud.dto.InvoiceRequestDTO;
import com.invoicefraud.dto.InvoiceResponseDTO;
import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.Vendor;

@Component
public class InvoiceMapper {

	public Invoice toEntity(InvoiceRequestDTO requestDTO) {
		if (requestDTO == null) {
			return null;
		}

		Vendor vendor = new Vendor();
		vendor.setId(requestDTO.getVendorId());

		Invoice invoice = new Invoice();
		invoice.setInvoiceNumber(requestDTO.getInvoiceNumber());
		invoice.setAmount(requestDTO.getAmount());
		invoice.setInvoiceDate(requestDTO.getInvoiceDate());
		invoice.setFraudScore(requestDTO.getFraudScore());
		invoice.setStatus(requestDTO.getStatus());
		invoice.setVendor(vendor);
		invoice.setDescription(requestDTO.getDescription());
		return invoice;
	}

	public InvoiceResponseDTO toResponseDTO(Invoice invoice) {
		if (invoice == null) {
			return null;
		}

		Vendor vendor = invoice.getVendor();

		InvoiceResponseDTO dto = new InvoiceResponseDTO();
		dto.setId(invoice.getId());
		dto.setInvoiceNumber(invoice.getInvoiceNumber());
		dto.setAmount(invoice.getAmount());
		dto.setInvoiceDate(invoice.getInvoiceDate());
		dto.setFraudScore(invoice.getFraudScore());
		dto.setStatus(invoice.getStatus());
		dto.setVendorId(vendor != null ? vendor.getId() : null);
		dto.setVendorName(vendor != null ? vendor.getVendorName() : null);
		dto.setCreatedAt(invoice.getCreatedAt());
		dto.setUpdatedAt(invoice.getUpdatedAt());
		dto.setDescription(invoice.getDescription());
		dto.setInvestigationNotes(invoice.getInvestigationNotes());
		return dto;
	}
}
