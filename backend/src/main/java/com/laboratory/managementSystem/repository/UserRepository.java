package com.laboratory.managementSystem.repository;

import com.laboratory.managementSystem.entity.SystemUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * [INTERFACE] UserRepository
 * Package  : com.laboratory.managementSystem.repository
 * Data Access Layer for SystemUser.
 * Extends JpaRepository — CRUD + paging/sorting out of the box.
 */
@Repository
public interface UserRepository extends JpaRepository<SystemUser, Long> {

    /** Used by Spring Security's UserDetailsService to load a user at login. */
    Optional<SystemUser> findByUsername(String username);

    /** Check duplicate usernames before creating a new user. */
    boolean existsByUsername(String username);

    /** Check duplicate email addresses (for password reset). */
    boolean existsByEmail(String email);
}

