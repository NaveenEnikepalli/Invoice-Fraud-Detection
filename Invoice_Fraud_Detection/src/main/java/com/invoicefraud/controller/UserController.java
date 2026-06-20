package com.invoicefraud.controller;

import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.invoicefraud.dto.ApiResponse;
import com.invoicefraud.dto.UserProfileResponseDTO;
import com.invoicefraud.dto.UserResponseDTO;
import com.invoicefraud.service.UserService;
import com.invoicefraud.service.CurrentUserService;
import com.invoicefraud.entity.User;
import com.invoicefraud.exception.UnauthorizedException;

@RestController
@RequestMapping("/api/users")
public class UserController {

	private final UserService userService;
	private final CurrentUserService currentUserService;

	public UserController(UserService userService, CurrentUserService currentUserService) {
		this.userService = userService;
		this.currentUserService = currentUserService;
	}

	@GetMapping("/profile/{id}")
	public ResponseEntity<ApiResponse<UserProfileResponseDTO>> getProfile(@PathVariable Long id) {
		User currentUser = currentUserService.getCurrentUser();
		if (!currentUser.getId().equals(id)) {
			throw new UnauthorizedException("You are not authorized to access this profile");
		}
		UserProfileResponseDTO profile = userService.getProfile(id);
		return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", profile));
	}

	@GetMapping
	public ResponseEntity<ApiResponse<List<UserResponseDTO>>> getAllUsers() {
		// Restrict access to prevent user enumeration
		throw new UnauthorizedException("Access denied. Listing all users is restricted.");
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
		User currentUser = currentUserService.getCurrentUser();
		if (!currentUser.getId().equals(id)) {
			throw new UnauthorizedException("You are not authorized to delete this user");
		}
		userService.deleteUser(id);
		return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
	}

}
