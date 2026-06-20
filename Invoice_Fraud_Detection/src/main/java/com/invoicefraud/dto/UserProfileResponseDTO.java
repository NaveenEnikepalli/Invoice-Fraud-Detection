package com.invoicefraud.dto;

import java.time.LocalDateTime;

public class UserProfileResponseDTO {

	private String fullName;
	private String email;
	private LocalDateTime createdAt;

	public UserProfileResponseDTO() {
	}

	public UserProfileResponseDTO(String fullName, String email, LocalDateTime createdAt) {
		this.fullName = fullName;
		this.email = email;
		this.createdAt = createdAt;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
