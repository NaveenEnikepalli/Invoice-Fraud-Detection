package com.invoicefraud.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DocumentStorageService {

	private final Path fileStorageLocation;

	public DocumentStorageService() {
		this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
		try {
			Files.createDirectories(this.fileStorageLocation);
		} catch (IOException ex) {
			throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
		}
	}

	public String storeFile(MultipartFile file) {
		String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
		String fileExtension = "";

		try {
			if (originalFileName.contains("..")) {
				throw new IllegalArgumentException("Sorry! Filename contains invalid path sequence " + originalFileName);
			}

			int dotIndex = originalFileName.lastIndexOf('.');
			if (dotIndex > 0) {
				fileExtension = originalFileName.substring(dotIndex);
			}

			String targetFileName = UUID.randomUUID().toString() + fileExtension;
			Path targetLocation = this.fileStorageLocation.resolve(targetFileName);

			Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

			return targetLocation.toString();
		} catch (IOException ex) {
			throw new RuntimeException("Could not store file " + originalFileName + ". Please try again!", ex);
		}
	}

	public void deleteFile(String filePathString) {
		try {
			Path filePath = Paths.get(filePathString);
			Files.deleteIfExists(filePath);
		} catch (IOException e) {
			throw new RuntimeException("Could not delete file at: " + filePathString, e);
		}
	}

	public org.springframework.core.io.Resource loadFileAsResource(String filePathString) {
		try {
			Path filePath = Paths.get(filePathString).toAbsolutePath().normalize();
			org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
			if (resource.exists()) {
				return resource;
			} else {
				throw new RuntimeException("File not found at: " + filePathString);
			}
		} catch (Exception ex) {
			throw new RuntimeException("File not found at: " + filePathString, ex);
		}
	}
}
