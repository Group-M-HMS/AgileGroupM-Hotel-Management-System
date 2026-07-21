package com.nibm.room_service.service;

import com.nibm.room_service.dto.RoomAmenityDto;
import com.nibm.room_service.dto.RoomBasicInfo;
import com.nibm.room_service.dto.RoomDetailResponse;
import com.nibm.room_service.dto.RoomImageDto;
import com.nibm.room_service.entity.RoomAmenity;
import com.nibm.room_service.entity.RoomImage;
import com.nibm.room_service.entity.Room;
import com.nibm.room_service.repository.RoomAmenityRepository;
import com.nibm.room_service.repository.RoomImageRepository;
import com.nibm.room_service.repository.RoomRepository;
import com.nibm.room_service.exception.RoomNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomDetailService {

    private final RoomRepository roomRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomAmenityRepository roomAmenityRepository;

    public RoomDetailService(RoomRepository roomRepository,
                             RoomImageRepository roomImageRepository,
                             RoomAmenityRepository roomAmenityRepository) {
        this.roomRepository = roomRepository;
        this.roomImageRepository = roomImageRepository;
        this.roomAmenityRepository = roomAmenityRepository;
    }

    @Transactional(readOnly = true)
    public RoomDetailResponse getRoomDetail(Long roomId) {
        Room room = roomRepository.findById(roomId).orElseThrow(() -> new RoomNotFoundException(roomId));
        RoomBasicInfo basicInfo = new RoomBasicInfo(
                room.getId(), 
                room.getTitle(), 
                room.getFullDescription(), 
                room.getMaxOccupancy(),
                room.getSizeSqm(),
                room.getBedCount(),
                room.getBedType(),
                room.getAverageRating(),
                room.getReviewCount(),
                room.getPricePerNight()
        );
        
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
