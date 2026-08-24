package com.hms.booking_service.service;

import com.hms.booking_service.dto.*;
import com.hms.booking_service.entity.GuestRequest;
import com.hms.booking_service.entity.RequestKind;
import com.hms.booking_service.entity.RequestStatus;
import com.hms.booking_service.exception.BookingNotFoundException;
import com.hms.booking_service.repository.GuestRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class GuestRequestService {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("hh:mm a");

    private final GuestRequestRepository guestRequestRepository;

    public GuestRequestService(GuestRequestRepository guestRequestRepository) {
        this.guestRequestRepository = guestRequestRepository;
    }

    @Transactional(readOnly = true)
    public List<GuestRequestResponse> listAlerts(String status, String kind) {
        List<GuestRequest> requests;

        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            try {
                RequestStatus reqStatus = RequestStatus.valueOf(status.trim().toUpperCase());
                requests = guestRequestRepository.findByStatusOrderByCreatedAtDesc(reqStatus);
            } catch (IllegalArgumentException e) {
                requests = guestRequestRepository.findAllByOrderByCreatedAtDesc();
            }
        } else if (kind != null && !kind.isBlank() && !"all".equalsIgnoreCase(kind)) {
            try {
                RequestKind reqKind = RequestKind.valueOf(kind.trim().toUpperCase());
                requests = guestRequestRepository.findByKindOrderByCreatedAtDesc(reqKind);
            } catch (IllegalArgumentException e) {
                requests = guestRequestRepository.findAllByOrderByCreatedAtDesc();
            }
        } else {
            requests = guestRequestRepository.findAllByOrderByCreatedAtDesc();
        }

        return requests.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public GuestRequestStatsResponse getStats() {
        long total = guestRequestRepository.count();
        long pending = guestRequestRepository.countByStatus(RequestStatus.PENDING);
        long approved = guestRequestRepository.countByStatus(RequestStatus.APPROVED);
        long dismissed = guestRequestRepository.countByStatus(RequestStatus.DISMISSED);

        return new GuestRequestStatsResponse(total, pending, approved, dismissed);
    }

    @Transactional
    public GuestRequestResponse createRequest(CreateGuestRequestDto dto) {
        GuestRequest request = new GuestRequest();
        request.setKind(dto.kind() != null ? dto.kind() : RequestKind.REQUEST);
        request.setTitle(dto.title().trim());
        request.setDetail(dto.detail().trim());
        request.setRoomId(dto.roomId());
        request.setBookingId(dto.bookingId());
        request.setCustomerId(dto.customerId());
        request.setGuestName(dto.guestName());
        request.setStatus(RequestStatus.PENDING);
        request.setCreatedAt(LocalDateTime.now());

        GuestRequest saved = guestRequestRepository.save(request);
        return toResponse(saved);
    }

    @Transactional
    public GuestRequestResponse resolveRequest(Long id, ResolveGuestRequestDto dto) {
        GuestRequest request = guestRequestRepository.findById(id)
                .orElseThrow(() -> new BookingNotFoundException(id));

        request.setStatus(dto.status());
        request.setResolvedBy(dto.resolvedBy() != null ? dto.resolvedBy() : "STAFF");
        request.setResolvedAt(LocalDateTime.now());

        GuestRequest saved = guestRequestRepository.save(request);
        return toResponse(saved);
    }

    private GuestRequestResponse toResponse(GuestRequest req) {
        String timeStr = req.getCreatedAt() != null ? req.getCreatedAt().format(TIME_FORMATTER) : "Just now";
        return new GuestRequestResponse(
                req.getId(),
                req.getKind().name().toLowerCase(),
                req.getTitle(),
                req.getDetail(),
                req.getRoomId(),
                req.getBookingId(),
                req.getGuestName(),
                req.getStatus().name().toLowerCase(),
                timeStr,
                req.getResolvedBy(),
                req.getResolvedAt(),
                req.getCreatedAt()
        );
    }
}
