package com.invoicefraud.service;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.invoicefraud.dto.LoginRequestDTO;
import com.invoicefraud.dto.RegisterRequestDTO;
import com.invoicefraud.dto.UserProfileResponseDTO;
import com.invoicefraud.dto.UserResponseDTO;
import com.invoicefraud.entity.User;
import com.invoicefraud.exception.DuplicateResourceException;
import com.invoicefraud.exception.ResourceNotFoundException;
import com.invoicefraud.exception.UnauthorizedException;
import com.invoicefraud.repository.UserRepository;
import org.mindrot.jbcrypt.BCrypt;

import jakarta.validation.ValidationException;

@Service
public class UserServiceImpl implements UserService {

	private final UserRepository userRepository;
	private final AuditLogService auditLogService;

	public UserServiceImpl(UserRepository userRepository, AuditLogService auditLogService) {
		this.userRepository = userRepository;
		this.auditLogService = auditLogService;
	}

	@Override
	@Transactional
	public UserResponseDTO register(RegisterRequestDTO request) {
		if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
			throw new ValidationException("Email is required");
		}
		if (request.getPassword() == null || request.getPassword().length() < 6) {
			throw new ValidationException("Password must be at least 6 characters long");
		}

		String email = request.getEmail().trim().toLowerCase();

		if (userRepository.existsByEmail(email)) {
			throw new DuplicateResourceException("User with email " + request.getEmail() + " already exists");
		}

		User user = new User();
		user.setFullName(request.getFullName().trim());
		user.setEmail(email);
		
		// Hash password using BCrypt
		String hashedPassword = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());
		user.setPassword(hashedPassword);

		User savedUser = userRepository.save(user);

		// Log user registration
		auditLogService.logAction(
				savedUser.getEmail(),
				"USER_REGISTRATION",
				"User",
				savedUser.getId(),
				"User registered: " + savedUser.getEmail()
		);

		return convertToResponseDTO(savedUser);
	}

	@Override
	@Transactional(readOnly = true)
	public UserResponseDTO login(LoginRequestDTO request) {
		String email = request.getEmail().trim().toLowerCase();

		User user = userRepository.findByEmail(email)
				.orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

		// Compare input password with stored BCrypt hash
		if (!BCrypt.checkpw(request.getPassword(), user.getPassword())) {
			throw new UnauthorizedException("Invalid email or password");
		}

		// Log user login
		auditLogService.logAction(
				user.getEmail(),
				"USER_LOGIN",
				"User",
				user.getId(),
				"User logged in: " + user.getEmail()
		);

		return convertToResponseDTO(user);
	}

	@Override
	@Transactional(readOnly = true)
	public UserProfileResponseDTO getProfile(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

		return new UserProfileResponseDTO(
				user.getFullName(),
				user.getEmail(),
				user.getCreatedAt()
		);
	}

	@Override
	@Transactional(readOnly = true)
	public List<UserResponseDTO> getAllUsers() {
		return userRepository.findAll().stream()
				.map(this::convertToResponseDTO)
				.toList();
	}

	@Override
	@Transactional
	public void deleteUser(Long id) {
		if (!userRepository.existsById(id)) {
			throw new ResourceNotFoundException("User not found with id: " + id);
		}
		User user = userRepository.findById(id).orElse(null);
		userRepository.deleteById(id);

		if (user != null) {
			auditLogService.logAction(
					"USER_DELETE",
					"User",
					id,
					"Deleted user " + user.getEmail()
			);
		}
	}

	private UserResponseDTO convertToResponseDTO(User user) {
		return new UserResponseDTO(
				user.getId(),
				user.getFullName(),
				user.getEmail(),
				user.getCreatedAt()
		);
	}
}
