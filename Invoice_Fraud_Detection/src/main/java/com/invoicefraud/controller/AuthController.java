package com.invoicefraud.controller;

import java.util.HashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.invoicefraud.dto.LoginRequestDTO;
import com.invoicefraud.dto.RegisterRequestDTO;
import com.invoicefraud.dto.UserResponseDTO;
import com.invoicefraud.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final UserService userService;

	public AuthController(UserService userService) {
		this.userService = userService;
	}

	@PostMapping("/register")
	public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequestDTO request) {
		userService.register(request);
		Map<String, Object> response = new HashMap<>();
		response.put("success", true);
		response.put("message", "User registered successfully");
		return ResponseEntity.status(HttpStatus.CREATED).body(response);
	}

	@PostMapping("/login")
	public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequestDTO request) {
		UserResponseDTO user = userService.login(request);
		Map<String, Object> response = new HashMap<>();
		response.put("success", true);
		response.put("message", "Login successful");
		response.put("user", user);
		return ResponseEntity.ok(response);
	}
}
