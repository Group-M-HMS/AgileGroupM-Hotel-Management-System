package com.nibm.room_service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.math.BigDecimal;

@Schema(description = "A room returned from a search, with pricing and capacity info")
public class RoomResponse {

    @Schema(description = "Unique room ID", example = "1")
    private Long id;

    @Schema(description = "Room title", example = "Standard Jungle View")
    private String title;

    @Schema(description = "URL to the room's thumbnail image", example = "https://cdn.example.com/rooms/1.jpg")
    private String thumbnailUrl;

    @Schema(description = "Price per night", example = "100.00")
    private BigDecimal pricePerNight;

    @Schema(description = "Maximum number of guests this room can accommodate", example = "3")
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
