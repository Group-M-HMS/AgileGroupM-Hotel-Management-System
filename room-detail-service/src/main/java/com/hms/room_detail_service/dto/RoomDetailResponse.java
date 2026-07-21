package com.hms.room_detail_service.dto;

import java.util.List;

public record RoomDetailResponse(
        Long id,
        String name,
        String description,
        Integer maxOccupancy,
        List<String> images,
        List<String> amenities
) {
    public static RoomDetailResponse of(RoomBasicInfo basicInfo,
                                        List<RoomImageDto> images,
                                        List<RoomAmenityDto> amenities) {
        return new RoomDetailResponse(
                basicInfo.id(),
                basicInfo.name(),
                basicInfo.description(),
                basicInfo.maxOccupancy(),
                images.stream().map(RoomImageDto::imageUrl).toList(),
                amenities.stream().map(RoomAmenityDto::amenityName).toList()
        );
    }
}
