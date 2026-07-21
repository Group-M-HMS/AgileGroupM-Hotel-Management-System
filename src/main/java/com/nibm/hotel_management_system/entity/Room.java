package com.nibm.hotel_management_system.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
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
}