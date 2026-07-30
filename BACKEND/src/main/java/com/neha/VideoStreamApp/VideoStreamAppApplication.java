package com.neha.VideoStreamApp;

import com.neha.VideoStreamApp.config.AppConstants;
import com.neha.VideoStreamApp.entities.Provider;
import com.neha.VideoStreamApp.entities.Role;
import com.neha.VideoStreamApp.entities.User;
import com.neha.VideoStreamApp.repositories.RoleRepository;
import com.neha.VideoStreamApp.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.security.crypto.password.PasswordEncoder;

@EnableJpaAuditing
@SpringBootApplication
public class VideoStreamAppApplication implements CommandLineRunner {

	private final Logger logger = LoggerFactory.getLogger(VideoStreamAppApplication.class);

	@Autowired
	private RoleRepository roleRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Value("${app.admin.email}")
	private String adminEmail;

	@Value("${app.admin.password}")
	private String adminPassword;

	public static void main(String[] args) {
		SpringApplication.run(VideoStreamAppApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {

		roleRepository.findByName("ROLE_" + AppConstants.ADMIN_ROLE).ifPresentOrElse(
			role -> logger.debug("Admin role exists"),
			() -> {
				Role role = new Role();
				role.setName("ROLE_" + AppConstants.ADMIN_ROLE);
				roleRepository.save(role);
				logger.info("Admin role created");
			}
		);

		roleRepository.findByName("ROLE_" + AppConstants.USER_ROLE).ifPresentOrElse(
			role -> logger.debug("User role exists"),
			() -> {
				Role role = new Role();
				role.setName("ROLE_" + AppConstants.USER_ROLE);
				roleRepository.save(role);
				logger.info("User role created");
			}
		);

		if (!userRepository.existsByEmail(adminEmail)) {
			Role adminRole = roleRepository
					.findByName("ROLE_" + AppConstants.ADMIN_ROLE)
					.orElseThrow(() -> new RuntimeException("Admin Role Not Found"));

			User admin = new User();
			admin.setName("Admin");
			admin.setEmail(adminEmail);
			admin.setPassword(passwordEncoder.encode(adminPassword));
			admin.setProvider(Provider.LOCAL);
			admin.getRoles().add(adminRole);
			userRepository.save(admin);
			logger.info("Default admin user created");
		}
	}
}
