package com.invoicefraud.service;

import java.util.List;

import com.invoicefraud.dto.InvoiceRequestDTO;
import com.invoicefraud.dto.InvoiceResponseDTO;

public interface InvoiceService {

	InvoiceResponseDTO createInvoice(InvoiceRequestDTO requestDTO);

	InvoiceResponseDTO getInvoiceById(Long id);

	List<InvoiceResponseDTO> getAllInvoices();

	InvoiceResponseDTO updateInvoice(Long id, InvoiceRequestDTO requestDTO);

	void deleteInvoice(Long id);

	List<InvoiceResponseDTO> getInvoicesByVendor(Long vendorId);

	InvoiceResponseDTO updateInvoiceNotes(Long id, String notes);
}
