package com.invoicefraud.config;

import org.mindrot.jbcrypt.BCrypt;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.invoicefraud.entity.Invoice;
import com.invoicefraud.entity.InvoiceDocument;
import com.invoicefraud.entity.User;
import com.invoicefraud.entity.Vendor;
import com.invoicefraud.repository.InvoiceDocumentRepository;
import com.invoicefraud.repository.InvoiceRepository;
import com.invoicefraud.repository.UserRepository;
import com.invoicefraud.repository.VendorRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.List;

@Component
public class DatabaseInitializer implements CommandLineRunner {

	private static final String LEGACY_OWNER_EMAIL = "legacy-quarantine@invoice.local";

	private final UserRepository userRepository;
	private final VendorRepository vendorRepository;
	private final InvoiceRepository invoiceRepository;
	private final InvoiceDocumentRepository documentRepository;

	@org.springframework.beans.factory.annotation.Autowired(required = false)
	private DataSource dataSource;

	public DatabaseInitializer(
			UserRepository userRepository,
			VendorRepository vendorRepository,
			InvoiceRepository invoiceRepository,
			InvoiceDocumentRepository documentRepository) {
		this.userRepository = userRepository;
		this.vendorRepository = vendorRepository;
		this.invoiceRepository = invoiceRepository;
		this.documentRepository = documentRepository;
	}

	@Override
	@Transactional
	public void run(String... args) throws Exception {
		assignLegacyOrphanedRows();
		List<User> users = userRepository.findAll();
		boolean updated = false;
		for (User user : users) {
			String password = user.getPassword();
			// Check if the password is plain text (does not start with $2a$, $2b$, or $2y$ BCrypt prefixes)
			if (password != null && !password.startsWith("$2")) {
				String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
				user.setPassword(hashedPassword);
				userRepository.save(user);
				System.out.println("Hashed legacy plain-text password for user: " + user.getEmail());
				updated = true;
			}
		}
		if (updated) {
			System.out.println("Database Initialization: All legacy plain-text user passwords hashed successfully.");
		}
	}

	private void assignLegacyOrphanedRows() {
		if (dataSource == null) {
			System.out.println("Database Initialization: DataSource is null. Skipping assignLegacyOrphanedRows.");
			return;
		}

		User legacyOwner = userRepository.findByEmail(LEGACY_OWNER_EMAIL)
				.orElseGet(() -> {
					User user = new User();
					user.setFullName("Legacy Data Quarantine");
					user.setEmail(LEGACY_OWNER_EMAIL);
					user.setPassword(BCrypt.hashpw(java.util.UUID.randomUUID().toString(), BCrypt.gensalt()));
					return userRepository.save(user);
				});

		Long legacyOwnerId = legacyOwner.getId();

		try (Connection conn = dataSource.getConnection()) {
			boolean isMySql = "MySQL".equalsIgnoreCase(conn.getMetaData().getDatabaseProductName());
			System.out.println("Database Initialization: Connected to database. Engine is MySQL: " + isMySql);

			// Update vendors with invalid user_id natively to avoid legacy load proxy errors
			String updateVendors = "UPDATE vendors SET user_id = ? WHERE user_id = 0 OR user_id IS NULL OR user_id NOT IN (SELECT id FROM app_users)";
			try (PreparedStatement ps = conn.prepareStatement(updateVendors)) {
				ps.setLong(1, legacyOwnerId);
				int rows = ps.executeUpdate();
				if (rows > 0) {
					System.out.println("Database Initialization: Quarantined " + rows + " legacy vendors.");
				}
			}

			// Update invoices with invalid user_id natively
			String updateInvoices = "UPDATE invoices SET user_id = ? WHERE user_id = 0 OR user_id IS NULL OR user_id NOT IN (SELECT id FROM app_users)";
			try (PreparedStatement ps = conn.prepareStatement(updateInvoices)) {
				ps.setLong(1, legacyOwnerId);
				int rows = ps.executeUpdate();
				if (rows > 0) {
					System.out.println("Database Initialization: Quarantined " + rows + " legacy invoices.");
				}
			}

			// Update invoice_documents with invalid user_id natively
			String updateDocs = "UPDATE invoice_documents SET user_id = ? WHERE user_id = 0 OR user_id IS NULL OR user_id NOT IN (SELECT id FROM app_users)";
			try (PreparedStatement ps = conn.prepareStatement(updateDocs)) {
				ps.setLong(1, legacyOwnerId);
				int rows = ps.executeUpdate();
				if (rows > 0) {
					System.out.println("Database Initialization: Quarantined " + rows + " legacy invoice documents.");
				}
			}

			System.out.println("Database Initialization: Quarantined legacy ownerless data rows under " + LEGACY_OWNER_EMAIL + ".");

			if (isMySql) {
				// Drop global unique index on invoice_number to support proper user data isolation
				if (indexExists(conn, "invoices", "uk_invoices_invoice_number")) {
					executeSql(conn, "ALTER TABLE invoices DROP INDEX uk_invoices_invoice_number");
					System.out.println("Database Initialization: Dropped global unique constraint uk_invoices_invoice_number.");
				}

				// Natively enforce database constraints that failed at boot due to invalid user references
				if (!constraintExists(conn, "vendors", "FK7xprxqauf826m7nivfqwy2ea0")) {
					executeSql(conn, "alter table vendors add constraint FK7xprxqauf826m7nivfqwy2ea0 foreign key (user_id) references app_users (id)");
					System.out.println("Database Initialization: Successfully added foreign key constraint for vendors -> app_users.");
				}
				if (!constraintExists(conn, "invoices", "FK481rrej87l5vhpwnkxfghygdp")) {
					executeSql(conn, "alter table invoices add constraint FK481rrej87l5vhpwnkxfghygdp foreign key (user_id) references app_users (id)");
					System.out.println("Database Initialization: Successfully added foreign key constraint for invoices -> app_users.");
				}
				if (!constraintExists(conn, "invoice_documents", "FKmuqkxympfpnryel2f9t5bku7t")) {
					executeSql(conn, "alter table invoice_documents add constraint FKmuqkxympfpnryel2f9t5bku7t foreign key (user_id) references app_users (id)");
					System.out.println("Database Initialization: Successfully added foreign key constraint for invoice_documents -> app_users.");
				}
			}

		} catch (Exception e) {
			System.err.println("Database Initialization Error: " + e.getMessage());
		}
	}

	private boolean indexExists(Connection conn, String tableName, String indexName) {
		String sql = "SELECT INDEX_NAME FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?";
		try (PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setString(1, tableName);
			ps.setString(2, indexName);
			try (ResultSet rs = ps.executeQuery()) {
				return rs.next();
			}
		} catch (Exception e) {
			return false;
		}
	}

	private boolean constraintExists(Connection conn, String tableName, String constraintName) {
		String sql = "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?";
		try (PreparedStatement ps = conn.prepareStatement(sql)) {
			ps.setString(1, tableName);
			ps.setString(2, constraintName);
			try (ResultSet rs = ps.executeQuery()) {
				return rs.next();
			}
		} catch (Exception e) {
			return false;
		}
	}

	private void executeSql(Connection conn, String sql) throws Exception {
		try (Statement stmt = conn.createStatement()) {
			stmt.executeUpdate(sql);
		}
	}
}
