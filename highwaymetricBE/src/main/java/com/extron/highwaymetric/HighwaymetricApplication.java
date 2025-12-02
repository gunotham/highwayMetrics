package com.extron.highwaymetric;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class HighwaymetricApplication {

	public static void main(String[] args) {
		SpringApplication.run(HighwaymetricApplication.class, args);
	}

}
