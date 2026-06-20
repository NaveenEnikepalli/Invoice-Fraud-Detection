package com.invoicefraud.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.invoicefraud.dto.FraudDetectionResult;
import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.fraud.DuplicateInvoiceRule;
import com.invoicefraud.fraud.FraudRule;
import com.invoicefraud.fraud.SimilarInvoiceNumberRule;
import com.invoicefraud.fraud.SuspiciousAmountRule;
import com.invoicefraud.fraud.VendorRiskRule;
import com.invoicefraud.repository.VendorRepository;

class FraudDetectionServiceTests {

	private FraudDetectionService fraudDetectionService;
	private VendorRepository vendorRepository;

	@BeforeEach
	void setUp() {
		vendorRepository = Mockito.mock(VendorRepository.class);

		List<FraudRule> rules = Arrays.asList(
				new DuplicateInvoiceRule(),
				new SimilarInvoiceNumberRule(),
				new VendorRiskRule(),
				new SuspiciousAmountRule()
		);

		fraudDetectionService = new FraudDetectionService(rules, vendorRepository);
	}

	@Test
	void testExactDuplicateInvoiceNumber() {
		Vendor vendor = new Vendor();
		vendor.setId(1L);
		vendor.setVendorName("Acme");
		vendor.setRiskScore(BigDecimal.ZERO);

		Invoice currentInvoice = new Invoice();
		currentInvoice.setInvoiceNumber("INV-1001");
		currentInvoice.setVendor(vendor);

		Invoice historical = new Invoice();
		historical.setId(2L);
		historical.setInvoiceNumber("INV-1001");
		historical.setVendor(vendor);

		FraudDetectionResult result = fraudDetectionService.detectFraud(currentInvoice, Arrays.asList(historical));

		assertEquals(new BigDecimal("40.00"), result.getFraudScore());
		assertEquals("Medium", result.getRiskCategory());
		assertTrue(result.getTriggeredRules().stream().anyMatch(r -> r.contains("Duplicate Invoice")));
	}

	@Test
	void testSimilarInvoiceNumber() {
		Vendor vendor = new Vendor();
		vendor.setId(1L);
		vendor.setVendorName("Acme");
		vendor.setRiskScore(BigDecimal.ZERO);

		Invoice currentInvoice = new Invoice();
		currentInvoice.setInvoiceNumber("INV-100I");
		currentInvoice.setVendor(vendor);

		Invoice historical = new Invoice();
		historical.setId(2L);
		historical.setInvoiceNumber("INV-1001");
		historical.setVendor(vendor);

		FraudDetectionResult result = fraudDetectionService.detectFraud(currentInvoice, Arrays.asList(historical));

		assertTrue(result.getFraudScore().compareTo(BigDecimal.ZERO) > 0);
		assertTrue(result.getTriggeredRules().stream().anyMatch(r -> r.contains("Similar Invoice")));
	}

	@Test
	void testVendorRiskScoreIntegration() {
		Vendor vendor = new Vendor();
		vendor.setId(1L);
		vendor.setVendorName("Acme");
		vendor.setRiskScore(new BigDecimal("45.00"));

		Invoice currentInvoice = new Invoice();
		currentInvoice.setInvoiceNumber("INV-9999");
		currentInvoice.setVendor(vendor);

		FraudDetectionResult result = fraudDetectionService.detectFraud(currentInvoice, new ArrayList<>());

		assertEquals(new BigDecimal("20.00"), result.getFraudScore());
		assertEquals("Low", result.getRiskCategory());
	}

	@Test
	void testSuspiciousAmountAbsoluteThreshold() {
		Vendor vendor = new Vendor();
		vendor.setId(1L);
		vendor.setRiskScore(BigDecimal.ZERO);

		Invoice currentInvoice = new Invoice();
		currentInvoice.setInvoiceNumber("INV-8888");
		currentInvoice.setVendor(vendor);
		currentInvoice.setAmount(new BigDecimal("60000.00")); // > $50,000

		FraudDetectionResult result = fraudDetectionService.detectFraud(currentInvoice, new ArrayList<>());

		assertEquals(new BigDecimal("25.00"), result.getFraudScore());
		assertEquals("Low", result.getRiskCategory());
		assertTrue(result.getTriggeredRules().stream().anyMatch(r -> r.contains("Unusually High Amount")));
	}

	@Test
	void testSuspiciousAmountDeviation() {
		Vendor vendor = new Vendor();
		vendor.setId(1L);
		vendor.setRiskScore(BigDecimal.ZERO);

		Invoice hist1 = new Invoice();
		hist1.setId(10L);
		hist1.setInvoiceNumber("INV-1010");
		hist1.setAmount(new BigDecimal("1000.00"));

		Invoice hist2 = new Invoice();
		hist2.setId(11L);
		hist2.setInvoiceNumber("INV-1011");
		hist2.setAmount(new BigDecimal("2000.00"));

		// Average is $1500.00
		List<Invoice> history = Arrays.asList(hist1, hist2);

		Invoice currentInvoice = new Invoice();
		currentInvoice.setInvoiceNumber("INV-8889");
		currentInvoice.setVendor(vendor);
		currentInvoice.setAmount(new BigDecimal("5000.00")); // > 3x average ($1500)

		FraudDetectionResult result = fraudDetectionService.detectFraud(currentInvoice, history);

		assertEquals(new BigDecimal("25.00"), result.getFraudScore());
		assertEquals("Low", result.getRiskCategory());
		assertTrue(result.getTriggeredRules().stream().anyMatch(r -> r.contains("Unusually High Amount")));
	}

	@Test
	void explanationKeepsStoredFraudScoreAsSourceOfTruth() {
		Vendor vendor = new Vendor();
		vendor.setId(1L);
		vendor.setRiskScore(BigDecimal.ZERO);

		Invoice currentInvoice = new Invoice();
		currentInvoice.setInvoiceNumber("INV-1001");
		currentInvoice.setVendor(vendor);
		currentInvoice.setAmount(new BigDecimal("60000.00"));

		Invoice duplicate = new Invoice();
		duplicate.setId(2L);
		duplicate.setInvoiceNumber("INV-1001");
		duplicate.setVendor(vendor);
		duplicate.setAmount(new BigDecimal("60000.00"));

		FraudDetectionResult result = fraudDetectionService.explainStoredFraud(
				currentInvoice,
				Arrays.asList(duplicate),
				new BigDecimal("65.00")
		);

		assertEquals(new BigDecimal("65.00"), result.getFraudScore());
		assertEquals("High", result.getRiskCategory());
		assertTrue(result.getTriggeredRules().stream().anyMatch(r -> r.contains("Duplicate Invoice")));
	}
}
