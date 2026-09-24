package com.laboratory.managementSystem.service;

import com.laboratory.managementSystem.entity.SystemUser;

import java.util.List;

/**
 * [INTERFACE] UserService
 * Package  : com.laboratory.managementSystem.service
 * Business logic contract for system user management (Admin only).
 */
public interface UserService {

    /** Admin creates a new Receptionist or Technician with a default password. */
    SystemUser createUser(String name, String username, String email, SystemUser.Role role);

    /** Admin deactivates (soft-delete) a user account. */
    void deactivateUser(Long userId);

    /** Admin reactivates a previously deactivated account. */
    void activateUser(Long userId);

    /** Fetch all active system users. */
    List<SystemUser> getAllActiveUsers();

    /**
     * Called when a user completes the forced-password-change flow on first login.
     * Updates the password hash and sets isPasswordChanged = true.
     */
    void changePassword(Long userId, String currentPassword, String newPassword);

    /** Find a single user by ID (throws ResourceNotFoundException if absent). */
    SystemUser findById(Long userId);
}

