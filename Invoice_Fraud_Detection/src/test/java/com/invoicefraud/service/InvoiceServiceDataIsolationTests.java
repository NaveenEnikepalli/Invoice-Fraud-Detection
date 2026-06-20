package com.invoicefraud.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.invoicefraud.dto.InvoiceResponseDTO;
import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.User;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.enums.InvoiceStatus;
import com.invoicefraud.mapper.InvoiceMapper;
import com.invoicefraud.repository.InvoiceRepository;
import com.invoicefraud.repository.VendorRepository;
import com.invoicefraud.repository.InvoiceDocumentRepository;

class InvoiceServiceDataIsolationTests {

	@Test
	void getAllInvoicesUsesCurrentUserScope() {
		InvoiceRepository invoiceRepository = mock(InvoiceRepository.class);
		VendorRepository vendorRepository = mock(VendorRepository.class);
		FraudDetectionService fraudDetectionService = mock(FraudDetectionService.class);
		AuditLogService auditLogService = mock(AuditLogService.class);
		CurrentUserService currentUserService = mock(CurrentUserService.class);
		InvoiceDocumentRepository documentRepository = mock(InvoiceDocumentRepository.class);
		DocumentStorageService storageService = mock(DocumentStorageService.class);

		User user = new User();
		user.setEmail("testuser@example.com");

		Vendor vendor = new Vendor();
		vendor.setId(10L);
		vendor.setVendorName("User A Vendor");
		vendor.setUser(user);

		Invoice invoice = new Invoice();
		invoice.setId(20L);
		invoice.setInvoiceNumber("A-001");
		invoice.setAmount(new BigDecimal("125.00"));
		invoice.setFraudScore(new BigDecimal("65.00"));
		invoice.setStatus(InvoiceStatus.REVIEW);
		invoice.setVendor(vendor);
		invoice.setUser(user);

		when(currentUserService.getCurrentUserEmail()).thenReturn(user.getEmail());
		when(invoiceRepository.findAllByUserEmail(user.getEmail())).thenReturn(List.of(invoice));

		InvoiceServiceImpl service = new InvoiceServiceImpl(
				invoiceRepository,
				vendorRepository,
				new InvoiceMapper(),
				fraudDetectionService,
				auditLogService,
				currentUserService,
				documentRepository,
				storageService
		);

		List<InvoiceResponseDTO> result = service.getAllInvoices();

		assertEquals(1, result.size());
		assertEquals("A-001", result.get(0).getInvoiceNumber());
		assertEquals(new BigDecimal("65.00"), result.get(0).getFraudScore());
		verify(invoiceRepository).findAllByUserEmail("testuser@example.com");
	}
}
