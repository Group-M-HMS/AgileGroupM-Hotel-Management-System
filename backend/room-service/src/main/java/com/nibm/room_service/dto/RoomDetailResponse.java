package com.nibm.room_service.dto;

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
                images.stream().map(RoomImageDto::imageUrl).toList(),
                amenities.stream().map(RoomAmenityDto::amenityName).toList()
        );
    }
}
