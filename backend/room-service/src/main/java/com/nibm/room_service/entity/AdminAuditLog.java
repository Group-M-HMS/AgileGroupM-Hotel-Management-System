package com.nibm.room_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "admin_audit_logs",
    indexes = {
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_timestamp", columnList = "timestamp")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "entity_type", nullable = false)
    private String entityType; // e.g. "ROOM"

    @Column(name = "entity_id", nullable = false)
    private String entityId; // e.g. roomId

    @Column(name = "action", nullable = false)
    private String action; // e.g. "STATUS_CHANGE"

    @Column(name = "old_status")
    private String oldStatus;

    @Column(name = "new_status", nullable = false)
    private String newStatus;

    @Column(name = "changed_by")
    private String changedBy;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "timestamp", nullable = false, updatable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }
}
