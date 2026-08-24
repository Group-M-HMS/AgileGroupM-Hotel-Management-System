package com.hms.booking_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "guest_requests",
    indexes = {
        @Index(name = "idx_guest_requests_status", columnList = "status"),
        @Index(name = "idx_guest_requests_kind", columnList = "kind"),
        @Index(name = "idx_guest_requests_created_at", columnList = "created_at DESC")
    }
)
@Getter
@Setter
@NoArgsConstructor
public class GuestRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "kind", nullable = false, length = 50)
    private RequestKind kind = RequestKind.REQUEST;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "detail", nullable = false, columnDefinition = "TEXT")
    private String detail;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "booking_id")
    private Long bookingId;

    @Column(name = "customer_id")
    private String customerId;

    @Column(name = "guest_name")
    private String guestName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "resolved_by")
    private String resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
