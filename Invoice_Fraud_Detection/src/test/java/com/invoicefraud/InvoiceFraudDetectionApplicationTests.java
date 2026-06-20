package com.invoicefraud;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import com.invoicefraud.repository.InvoiceRepository;
import com.invoicefraud.repository.VendorRepository;

@SpringBootTest(properties = {
		"spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
				+ "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration"
})
class InvoiceFraudDetectionApplicationTests {

	@MockitoBean
	private VendorRepository vendorRepository;

	@MockitoBean
	private InvoiceRepository invoiceRepository;

	@MockitoBean
	private com.invoicefraud.repository.AuditLogRepository auditLogRepository;

	@MockitoBean
	private com.invoicefraud.repository.InvoiceDocumentRepository invoiceDocumentRepository;

	@MockitoBean
	private com.invoicefraud.repository.UserRepository userRepository;

	@Test
	void contextLoads() {
	}

}
