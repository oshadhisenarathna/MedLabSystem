package com.laboratory.managementSystem.service.impl;

import com.laboratory.managementSystem.entity.SystemUser;
import com.laboratory.managementSystem.exception.ResourceNotFoundException;
import com.laboratory.managementSystem.repository.UserRepository;
import com.laboratory.managementSystem.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * [CLASS] UserServiceImpl
 * Package  : com.laboratory.managementSystem.service.impl
 * Implements UserService.
 */
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private static final String DEFAULT_PASSWORD = "Lab@1234";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public SystemUser createUser(String name, String username, String email, SystemUser.Role role) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username '" + username + "' is already taken.");
        }
        SystemUser user = SystemUser.builder()
                .name(name)
                .username(username)
                .email(email)
                .role(role)
                .passwordHash(passwordEncoder.encode(DEFAULT_PASSWORD))
                .isPasswordChanged(false)
                .isActive(true)
                .build();
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deactivateUser(Long userId) {
        SystemUser user = findById(userId);
        user.setIsActive(false);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void activateUser(Long userId) {
        SystemUser user = findById(userId);
        user.setIsActive(true);
        userRepository.save(user);
    }

    @Override
    public List<SystemUser> getAllActiveUsers() {
        return userRepository.findAll().stream()
                .filter(SystemUser::getIsActive)
                .toList();
    }

    @Override
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        SystemUser user = findById(userId);
        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Current password is incorrect.");
        }
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setIsPasswordChanged(true);
        userRepository.save(user);
    }

    @Override
    public SystemUser findById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }
}

