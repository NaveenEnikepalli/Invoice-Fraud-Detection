package com.invoicefraud.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.invoicefraud.dto.ApiResponse;

import jakarta.validation.ConstraintViolationException;
import jakarta.validation.ValidationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResponse<Map<String, String>>> handleMethodArgumentNotValidException(
			MethodArgumentNotValidException exception) {
		log.warn("Validation failed: {}", exception.getMessage());
		Map<String, String> errors = new LinkedHashMap<>();

		exception.getBindingResult().getFieldErrors().forEach(error -> {
			errors.put(error.getField(), error.getDefaultMessage());
			log.warn("Validation field error - Field: {}, Message: {}", error.getField(), error.getDefaultMessage());
		});

		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.failure("Validation failed", errors));
	}

	@ExceptionHandler({ ValidationException.class, ConstraintViolationException.class })
	public ResponseEntity<ApiResponse<String>> handleValidationException(Exception exception) {
		log.warn("Validation/Constraint exception: {}", exception.getMessage(), exception);
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.failure(exception.getMessage(), null));
	}

	@ExceptionHandler(IllegalArgumentException.class)
	public ResponseEntity<ApiResponse<String>> handleIllegalArgumentException(IllegalArgumentException exception) {
		log.warn("Illegal argument: {}", exception.getMessage());
		return ResponseEntity.status(HttpStatus.BAD_REQUEST)
				.body(ApiResponse.failure(exception.getMessage(), null));
	}

	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiResponse<String>> handleResourceNotFoundException(
			ResourceNotFoundException exception) {
		log.warn("Resource not found: {}", exception.getMessage());
		return ResponseEntity.status(HttpStatus.NOT_FOUND)
				.body(ApiResponse.failure(exception.getMessage(), null));
	}

	@ExceptionHandler(DuplicateResourceException.class)
	public ResponseEntity<ApiResponse<String>> handleDuplicateResourceException(
			DuplicateResourceException exception) {
		log.warn("Duplicate resource violation: {}", exception.getMessage());
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(ApiResponse.failure(exception.getMessage(), null));
	}

	@ExceptionHandler(UnauthorizedException.class)
	public ResponseEntity<ApiResponse<String>> handleUnauthorizedException(
			UnauthorizedException exception) {
		log.warn("Unauthorized access attempt: {}", exception.getMessage());
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
				.body(ApiResponse.failure(exception.getMessage(), null));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiResponse<String>> handleDataIntegrityViolationException(
			DataIntegrityViolationException exception) {
		log.error("Database integrity constraint violation: {}", exception.getMessage(), exception);
		String message = "Database Constraint Violation";
		Throwable rootCause = exception.getRootCause();
		if (rootCause != null) {
			String rootMsg = rootCause.getMessage();
			if (rootMsg != null) {
				if (rootMsg.contains("uk_invoices_invoice_number") || (rootMsg.contains("Duplicate entry") && rootMsg.contains("invoice_number"))) {
					message = "Invoice Number Already Exists";
				} else if (rootMsg.contains("uk_app_users_email") || (rootMsg.contains("Duplicate entry") && rootMsg.contains("email"))) {
					message = "User Email Already Exists";
				} else if (rootMsg.contains("foreign key constraint fails")) {
					message = "Invalid Reference: Database constraint violation (Foreign key check failed)";
				} else {
					message = "Database Exception: " + rootMsg;
				}
			}
		}
		return ResponseEntity.status(HttpStatus.CONFLICT)
				.body(ApiResponse.failure(message, null));
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResponse<String>> handleException(Exception exception) {
		log.error("Unexpected application error: ", exception);
		String message = exception.getMessage() != null ? exception.getMessage() : "An unexpected error occurred";
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
				.body(ApiResponse.failure(message, null));
	}
}
