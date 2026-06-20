package com.invoicefraud.repository;

import java.util.Optional;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.invoicefraud.entity.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

	Optional<Vendor> findByVendorEmail(String vendorEmail);

	boolean existsByVendorEmail(String vendorEmail);

	Optional<Vendor> findByIdAndUserEmail(Long id, String userEmail);

	Optional<Vendor> findByVendorEmailAndUserEmail(String vendorEmail, String userEmail);

	Optional<Vendor> findByVendorNameAndUserEmail(String vendorName, String userEmail);

	List<Vendor> findAllByUserEmail(String userEmail);

	List<Vendor> findAllByUserIsNull();

	long countByUserEmail(String userEmail);

	long countByRiskScoreGreaterThanEqual(java.math.BigDecimal score);

	long countByUserEmailAndRiskScoreGreaterThanEqual(String userEmail, java.math.BigDecimal score);
}
