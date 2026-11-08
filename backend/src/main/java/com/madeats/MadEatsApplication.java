package com.madeats;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MadEatsApplication {

    public static void main(String[] args) {
        SpringApplication.run(MadEatsApplication.class, args);
        System.out.println("==================================================");
        System.out.println(" MAD EATS Backend is successfully running!       ");
        System.out.println(" Server URL: http://localhost:8080/api/health     ");
        System.out.println("==================================================");
    }
}
