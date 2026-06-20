package com.invoicefraud.service;

import org.springframework.stereotype.Service;

import com.invoicefraud.entity.User;
import com.invoicefraud.exception.UnauthorizedException;
import com.invoicefraud.repository.UserRepository;

import jakarta.servlet.http.HttpServletRequest;

@Service
public class CurrentUserService {

	private final UserRepository userRepository;
	private final HttpServletRequest request;

	public CurrentUserService(UserRepository userRepository, HttpServletRequest request) {
		this.userRepository = userRepository;
		this.request = request;
	}

	public User getCurrentUser() {
		String email = request.getHeader("X-User-Email");
		if (email == null || email.trim().isEmpty()) {
			throw new UnauthorizedException("Missing X-User-Email header");
		}

		String normalizedEmail = email.trim().toLowerCase();
		return userRepository.findByEmail(normalizedEmail)
				.orElseThrow(() -> new UnauthorizedException("Invalid user session"));
	}

	public String getCurrentUserEmail() {
		return getCurrentUser().getEmail();
	}
}
