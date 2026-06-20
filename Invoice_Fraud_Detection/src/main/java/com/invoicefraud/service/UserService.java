package com.invoicefraud.service;

import java.util.List;
import com.invoicefraud.dto.LoginRequestDTO;
import com.invoicefraud.dto.RegisterRequestDTO;
import com.invoicefraud.dto.UserProfileResponseDTO;
import com.invoicefraud.dto.UserResponseDTO;

public interface UserService {

	UserResponseDTO register(RegisterRequestDTO request);

	UserResponseDTO login(LoginRequestDTO request);

	UserProfileResponseDTO getProfile(Long id);

	List<UserResponseDTO> getAllUsers();

	void deleteUser(Long id);
}
