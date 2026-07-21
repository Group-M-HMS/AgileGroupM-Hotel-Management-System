package com.nibm.room_service.dto;

import java.math.BigDecimal;
import java.util.List;

public record RoomDetailResponse(
        Long id,
        String name,
        String description,
        Integer maxOccupancy,
        Integer sizeSqm,
        BedInfo bedType,
        Float rating,
        Integer reviewCount,
        BigDecimal pricePerNight,
        List<String> images,
        List<String> amenities
) {
    public record BedInfo(Integer count, String type) {}

    public static RoomDetailResponse of(RoomBasicInfo basicInfo,
                                        List<RoomImageDto> images,
                                        List<RoomAmenityDto> amenities) {
        return new RoomDetailResponse(
                basicInfo.id(),
                basicInfo.name(),
                basicInfo.description(),
                basicInfo.maxOccupancy(),
                basicInfo.sizeSqm(),
                new BedInfo(basicInfo.bedCount(), basicInfo.bedType()),
                basicInfo.rating(),
                basicInfo.reviewCount(),
                basicInfo.pricePerNight(),
                images.stream().map(RoomImageDto::imageUrl).toList(),
                amenities.stream().map(RoomAmenityDto::amenityName).toList()
        );
    }
}
