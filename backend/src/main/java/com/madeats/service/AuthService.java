package com.madeats.service;

import com.madeats.dto.AuthResponse;
import com.madeats.dto.LoginRequest;
import com.madeats.dto.RegisterRequest;
import com.madeats.entity.User;
import com.madeats.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${OWNER_EMAIL:mathavanpalanisamy9@gmail.com}")
    private String defaultOwnerEmail;

    @Value("${OWNER_PASSWORD:maddy123}")
    private String defaultOwnerPassword;

    @PostConstruct
    public void initOwner() {
        if (!userRepository.existsByEmail(defaultOwnerEmail)) {
            User owner = new User();
            owner.setFullName("Restaurant Owner (Mathavan)");
            owner.setEmail(defaultOwnerEmail);
            owner.setPhone("9876543210");
            owner.setPassword(passwordEncoder.encode(defaultOwnerPassword));
            owner.setRole("OWNER");
            userRepository.save(owner);
        }
    }

    public AuthResponse register(RegisterRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(cleanEmail)) {
            return new AuthResponse("ALREADY_EXISTS", "An account with this email already exists. Please log in.");
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(cleanEmail);
        user.setPhone(request.getPhone().trim());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        
        String assignedRole = "CUSTOMER";
        if (cleanEmail.equalsIgnoreCase(defaultOwnerEmail)) {
            assignedRole = "OWNER";
        } else if (request.getRole() != null && request.getRole().equalsIgnoreCase("OWNER")) {
            assignedRole = "OWNER";
        }
        user.setRole(assignedRole);

        User savedUser = userRepository.save(user);

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getPhone(),
                savedUser.getRole()
        );

        return new AuthResponse("SUCCESS", "Registration successful! Welcome to MAD EATS.", userDto);
    }

    public AuthResponse login(LoginRequest request) {
        String cleanEmail = request.getEmail().trim().toLowerCase();
        Optional<User> userOpt = userRepository.findByEmail(cleanEmail);

        if (userOpt.isEmpty()) {
            return new AuthResponse(
                    "USER_NOT_FOUND",
                    "No account found with email '" + cleanEmail + "'. Please register your details first!"
            );
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return new AuthResponse("INVALID_PASSWORD", "Incorrect password. Please try again.");
        }

        AuthResponse.UserDto userDto = new AuthResponse.UserDto(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole()
        );

        return new AuthResponse("SUCCESS", "Login successful!", userDto);
    }

    public List<User> getAllCustomers() {
        return userRepository.findAll();
    }
}
