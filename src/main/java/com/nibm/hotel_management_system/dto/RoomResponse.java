package com.nibm.hotel_management_system.dto;

import java.math.BigDecimal;

public class RoomResponse {
    private Long id;
    private String title;
    private String thumbnailUrl;
    private BigDecimal pricePerNight;
    private Integer maxOccupancy;

    public RoomResponse(Long id, String title, String thumbnailUrl, BigDecimal pricePerNight, Integer maxOccupancy) {
        this.id = id;
        this.title = title;
        this.thumbnailUrl = thumbnailUrl;
        this.pricePerNight = pricePerNight;
        this.maxOccupancy = maxOccupancy;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public BigDecimal getPricePerNight() { return pricePerNight; }
    public Integer getMaxOccupancy() { return maxOccupancy; }
}