package com.invoicefraud.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.invoicefraud.entity.InvoiceDocument;

public interface InvoiceDocumentRepository extends JpaRepository<InvoiceDocument, Long> {
	java.util.List<InvoiceDocument> findAllByUserEmail(String userEmail);

	java.util.List<InvoiceDocument> findAllByUserIsNull();

	java.util.Optional<InvoiceDocument> findByIdAndUserEmail(Long id, String userEmail);
}
