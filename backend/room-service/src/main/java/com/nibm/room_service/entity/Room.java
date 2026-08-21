package com.nibm.room_service.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "rooms",
    indexes = {
        @Index(name = "idx_rooms_price_bed", columnList = "price_per_night, bed_type")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "room_number")
    private String roomNumber;

    @Column(name = "room_type")
    private String roomType;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    @Column(name = "price_per_night", nullable = false)
    private BigDecimal pricePerNight;

    @Min(value = 1, message = "Max occupancy must be at least 1")
    @Column(name = "max_occupancy", nullable = false)
    private Integer maxOccupancy;

    @Column(name = "size_sqm")
    private Integer sizeSqm;

    @Column(name = "bed_count")
    private Integer bedCount;

    @Column(name = "bed_type")
    private String bedType;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "average_rating")
    private Float averageRating = 0.0f;

    @Column(name = "review_count")
    private Integer reviewCount = 0;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
