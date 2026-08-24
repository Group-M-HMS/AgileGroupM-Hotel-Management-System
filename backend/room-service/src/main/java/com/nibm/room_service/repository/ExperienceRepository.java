package com.nibm.room_service.repository;

import com.nibm.room_service.entity.Experience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {

    List<Experience> findAllByActiveTrue();

    Optional<Experience> findByIdAndActiveTrue(Long id);

}
