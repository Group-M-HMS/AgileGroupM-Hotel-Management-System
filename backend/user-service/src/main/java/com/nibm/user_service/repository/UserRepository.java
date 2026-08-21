package com.nibm.user_service.repository;

import com.nibm.user_service.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {

    boolean existsByEmailAndDeletedFalse(String email);

    Optional<User> findByEmailAndDeletedFalse(String email);

    Optional<User> findByFirebaseUidAndDeletedFalse(String firebaseUid);

    List<User> findAllByDeletedFalseOrderByCreatedAtDesc();

    @Query("SELECT u FROM User u WHERE u.deleted = false AND (" +
            "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.phone) LIKE LOWER(CONCAT('%', :query, '%'))" +
            ") ORDER BY u.createdAt DESC")
    List<User> searchGuests(@Param("query") String query);
}