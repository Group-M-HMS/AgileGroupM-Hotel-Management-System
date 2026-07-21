package com.hms.room_detail_service.service;

import com.hms.room_detail_service.client.RoomServiceClient;
import com.hms.room_detail_service.dto.RoomAmenityDto;
import com.hms.room_detail_service.dto.RoomBasicInfo;
import com.hms.room_detail_service.dto.RoomDetailResponse;
import com.hms.room_detail_service.dto.RoomImageDto;
import com.hms.room_detail_service.entity.RoomAmenity;
import com.hms.room_detail_service.entity.RoomImage;
import com.hms.room_detail_service.repository.RoomAmenityRepository;
import com.hms.room_detail_service.repository.RoomImageRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomDetailService {

    private final RoomServiceClient roomServiceClient;
    private final RoomImageRepository roomImageRepository;
    private final RoomAmenityRepository roomAmenityRepository;

    public RoomDetailService(RoomServiceClient roomServiceClient,
                             RoomImageRepository roomImageRepository,
                             RoomAmenityRepository roomAmenityRepository) {
        this.roomServiceClient = roomServiceClient;
        this.roomImageRepository = roomImageRepository;
        this.roomAmenityRepository = roomAmenityRepository;
    }

    @Transactional(readOnly = true)
    public RoomDetailResponse getRoomDetail(Long roomId) {
        RoomBasicInfo basicInfo = roomServiceClient.getRoomBasicInfo(roomId);
        List<RoomImageDto> images = getRoomImages(roomId);
        List<RoomAmenityDto> amenities = getRoomAmenities(roomId);
        return RoomDetailResponse.of(basicInfo, images, amenities);
    }

    @Transactional(readOnly = true)
    public List<RoomImageDto> getRoomImages(Long roomId) {
        return roomImageRepository.findByRoomIdOrderByDisplayOrderAsc(roomId).stream()
                .map(img -> new RoomImageDto(img.getImageUrl(), img.getDisplayOrder()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoomAmenityDto> getRoomAmenities(Long roomId) {
        return roomAmenityRepository.findByRoomId(roomId).stream()
                .map(a -> new RoomAmenityDto(a.getAmenityName()))
                .toList();
    }


    @Transactional
    public RoomAmenity addAmenity(Long roomId, String amenityName) {
        RoomAmenity amenity = new RoomAmenity();
        amenity.setRoomId(roomId);
        amenity.setAmenityName(amenityName);
        return roomAmenityRepository.save(amenity);
    }

    @Transactional
    public RoomImage addImage(Long roomId, String imageUrl, Integer displayOrder) {
        RoomImage image = new RoomImage();
        image.setRoomId(roomId);
        image.setImageUrl(imageUrl);
        image.setDisplayOrder(displayOrder);
        return roomImageRepository.save(image);
    }


}
