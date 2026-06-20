package com.invoicefraud.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.invoicefraud.entity.Invoice;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

	Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

	boolean existsByInvoiceNumber(String invoiceNumber);

	Optional<Invoice> findByIdAndUserEmail(Long id, String userEmail);

	Optional<Invoice> findByInvoiceNumberAndUserEmail(String invoiceNumber, String userEmail);

	@Override
	@org.springframework.data.jpa.repository.Query("SELECT i FROM Invoice i JOIN FETCH i.vendor")
	List<Invoice> findAll();

	@org.springframework.data.jpa.repository.Query("SELECT i FROM Invoice i JOIN FETCH i.vendor WHERE i.user.email = :userEmail")
	List<Invoice> findAllByUserEmail(@org.springframework.data.repository.query.Param("userEmail") String userEmail);

	@org.springframework.data.jpa.repository.Query("SELECT i FROM Invoice i JOIN FETCH i.vendor WHERE i.user IS NULL")
	List<Invoice> findAllByUserIsNull();

	@org.springframework.data.jpa.repository.Query("SELECT i FROM Invoice i JOIN FETCH i.vendor WHERE i.vendor.id = :vendorId")
	List<Invoice> findByVendorId(@org.springframework.data.repository.query.Param("vendorId") Long vendorId);

	@org.springframework.data.jpa.repository.Query("SELECT i FROM Invoice i JOIN FETCH i.vendor WHERE i.vendor.id = :vendorId AND i.user.email = :userEmail")
	List<Invoice> findByVendorIdAndUserEmail(@org.springframework.data.repository.query.Param("vendorId") Long vendorId, @org.springframework.data.repository.query.Param("userEmail") String userEmail);

	long countByFraudScoreGreaterThanEqual(java.math.BigDecimal score);

	long countByVendorId(Long vendorId);

	long countByVendorIdAndFraudScoreGreaterThan(Long vendorId, java.math.BigDecimal score);

	long countByUserEmail(String userEmail);

	long countByUserEmailAndFraudScoreGreaterThanEqual(String userEmail, java.math.BigDecimal score);

	long countByVendorIdAndUserEmail(Long vendorId, String userEmail);

	long countByVendorIdAndUserEmailAndFraudScoreGreaterThan(Long vendorId, String userEmail, java.math.BigDecimal score);

	@org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.amount), 0) FROM Invoice i")
	java.math.BigDecimal sumAllAmounts();

	@org.springframework.data.jpa.repository.Query("SELECT COALESCE(SUM(i.amount), 0) FROM Invoice i WHERE i.user.email = :userEmail")
	java.math.BigDecimal sumAllAmountsByUserEmail(@org.springframework.data.repository.query.Param("userEmail") String userEmail);
}
