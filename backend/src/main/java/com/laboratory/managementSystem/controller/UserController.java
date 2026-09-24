package com.laboratory.managementSystem.controller;

import com.laboratory.managementSystem.entity.SystemUser;
import com.laboratory.managementSystem.repository.UserRepository;
import com.laboratory.managementSystem.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * [CLASS] UserController
 * Package  : com.laboratory.managementSystem.controller
 * * Handles Admin requests for managing staff users.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    private final UserRepository userRepository;


    @GetMapping
    public ResponseEntity<List<SystemUser>> getAllUsers() {
        List<SystemUser> users = userRepository.findAll();
        return ResponseEntity.ok(users);
    }


    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<Map<String, String>> deactivateUser(@PathVariable Long id) {
        SystemUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setIsActive(false);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User account deactivated successfully."));
    }


    @PatchMapping("/{id}/activate")
    public ResponseEntity<Map<String, String>> activateUser(@PathVariable Long id) {
        SystemUser user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setIsActive(true);
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "User account activated successfully."));
    }
}
