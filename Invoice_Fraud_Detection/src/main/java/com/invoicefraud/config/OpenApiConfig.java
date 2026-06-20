package com.invoicefraud.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI invoiceFraudDetectionOpenAPI() {
		return new OpenAPI()
				.info(new Info()
						.title("Invoice Fraud Detection System")
						.version("v1")
						.description("Invoice Fraud Detection REST API"));
	}
}
