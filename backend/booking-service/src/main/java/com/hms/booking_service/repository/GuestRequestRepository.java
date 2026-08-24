package com.hms.booking_service.repository;

import com.hms.booking_service.entity.GuestRequest;
import com.hms.booking_service.entity.RequestKind;
import com.hms.booking_service.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GuestRequestRepository extends JpaRepository<GuestRequest, Long> {

    List<GuestRequest> findAllByOrderByCreatedAtDesc();

    List<GuestRequest> findByStatusOrderByCreatedAtDesc(RequestStatus status);

    List<GuestRequest> findByKindOrderByCreatedAtDesc(RequestKind kind);

    long countByStatus(RequestStatus status);
}
