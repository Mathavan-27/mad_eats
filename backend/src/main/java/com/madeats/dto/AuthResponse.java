package com.madeats.dto;

public class AuthResponse {

    private String status;
    private String message;
    private UserDto user;

    public AuthResponse() {
    }

    public AuthResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }

    public AuthResponse(String status, String message, UserDto user) {
        this.status = status;
        this.message = message;
        this.user = user;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserDto getUser() {
        return user;
    }

    public void setUser(UserDto user) {
        this.user = user;
    }

    public static class UserDto {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String role;

        public UserDto() {
        }

        public UserDto(Long id, String fullName, String email, String phone, String role) {
            this.id = id;
            this.fullName = fullName;
            this.email = email;
            this.phone = phone;
            this.role = role;
        }

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }
    }
}
