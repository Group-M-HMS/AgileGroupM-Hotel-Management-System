package com.nibm.room_service.service;

import com.nibm.room_service.dto.*;
import com.nibm.room_service.entity.Room;
import com.nibm.room_service.entity.RoomAmenity;
import com.nibm.room_service.entity.RoomImage;
import com.nibm.room_service.exception.RoomNotFoundException;
import com.nibm.room_service.repository.RoomAmenityRepository;
import com.nibm.room_service.repository.RoomImageRepository;
import com.nibm.room_service.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomAmenityRepository roomAmenityRepository;
    private final RoomImageRepository roomImageRepository;

    public RoomService(RoomRepository roomRepository,
                       RoomAmenityRepository roomAmenityRepository,
                       RoomImageRepository roomImageRepository) {
        this.roomRepository = roomRepository;
        this.roomAmenityRepository = roomAmenityRepository;
        this.roomImageRepository = roomImageRepository;
    }

    /**
     * Search available rooms for booking dates and guest capacity.
     */
    public List<RoomResponse> searchAvailableRooms(RoomSearchRequest request) {
        List<Room> rooms = roomRepository.findAvailableRooms(
                request.getCheckIn(), request.getCheckOut(), request.getGuests()
        );

        List<Long> roomIds = rooms.stream().map(Room::getId).toList();
        Map<Long, List<String>> amenitiesByRoom = roomAmenityRepository.findByRoomIdIn(roomIds).stream()
                .collect(Collectors.groupingBy(
                        RoomAmenity::getRoomId,
                        Collectors.mapping(RoomAmenity::getAmenityName, Collectors.toList())
                ));

        return rooms.stream()
                .map(r -> {
                    List<String> amenities = amenitiesByRoom.getOrDefault(r.getId(), List.of());
                    List<String> topAmenities = amenities.stream().limit(3).toList();
                    return new RoomResponse(r.getId(), r.getTitle(), r.getThumbnailUrl(), r.getShortDescription(),
                            r.getPricePerNight(), r.getMaxOccupancy(), topAmenities);
                })
                .toList();
    }

    /**
     * Create a new room in inventory.
     * Subtask: NIBM2-573, NIBM2-574
     */
    @Transactional
    public RoomInventoryResponse createRoom(RoomCreateRequest request) {
        Room room = new Room();
        room.setTitle(request.title().trim());
        room.setRoomNumber(request.roomNumber() != null ? request.roomNumber().trim() : "");
        room.setRoomType(request.roomType() != null ? request.roomType().trim() : "Room");
        room.setShortDescription(request.shortDescription());
        room.setFullDescription(request.fullDescription());
        room.setPricePerNight(request.pricePerNight());
        room.setMaxOccupancy(request.maxOccupancy());
        room.setSizeSqm(request.sizeSqm() != null ? request.sizeSqm() : 30);
        room.setBedCount(request.bedCount() != null ? request.bedCount() : 1);
        room.setBedType(request.bedType() != null ? request.bedType() : "1 King Bed");
        room.setThumbnailUrl(request.thumbnailUrl());
        room.setAverageRating(5.0f);
        room.setReviewCount(0);
        room.setDeleted(false);
        room.setDeletedAt(null);

        Room saved = roomRepository.save(room);

        // Save gallery images if provided
        List<String> galleryUrls = new ArrayList<>();
        if (request.gallery() != null && !request.gallery().isEmpty()) {
            int order = 0;
            for (String imgUrl : request.gallery()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    RoomImage img = new RoomImage();
                    img.setRoomId(saved.getId());
                    img.setImageUrl(imgUrl.trim());
                    img.setDisplayOrder(order++);
                    roomImageRepository.save(img);
                    galleryUrls.add(imgUrl.trim());
                }
            }
            if (saved.getThumbnailUrl() == null && !galleryUrls.isEmpty()) {
                saved.setThumbnailUrl(galleryUrls.get(0));
                saved = roomRepository.save(saved);
            }
        }

        // Save amenities if provided
        List<String> amenityNames = new ArrayList<>();
        if (request.amenities() != null) {
            for (String name : request.amenities()) {
                if (name != null && !name.isBlank()) {
                    RoomAmenity amenity = new RoomAmenity();
                    amenity.setRoomId(saved.getId());
                    amenity.setAmenityName(name.trim());
                    roomAmenityRepository.save(amenity);
                    amenityNames.add(name.trim());
                }
            }
        }

        return toInventoryResponse(saved, galleryUrls, amenityNames);
    }

    /**
     * Update room details, price, max_occupancy, and full_description.
     * Subtask: NIBM2-570, NIBM2-617
     */
    @Transactional
    public RoomInventoryResponse updateRoom(Long roomId, RoomUpdateRequest request) {
        Room room = roomRepository.findByIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RoomNotFoundException(roomId));

        if (request.title() != null && !request.title().isBlank()) {
            room.setTitle(request.title().trim());
        }
        if (request.roomNumber() != null) {
            room.setRoomNumber(request.roomNumber().trim());
        }
        if (request.roomType() != null) {
            room.setRoomType(request.roomType().trim());
        }
        if (request.shortDescription() != null) {
            room.setShortDescription(request.shortDescription());
        }
        if (request.fullDescription() != null) {
            room.setFullDescription(request.fullDescription());
        }
        if (request.pricePerNight() != null) {
            room.setPricePerNight(request.pricePerNight());
        }
        if (request.maxOccupancy() != null) {
            room.setMaxOccupancy(request.maxOccupancy());
        }
        if (request.sizeSqm() != null) {
            room.setSizeSqm(request.sizeSqm());
        }
        if (request.bedCount() != null) {
            room.setBedCount(request.bedCount());
        }
        if (request.bedType() != null) {
            room.setBedType(request.bedType());
        }
        if (request.thumbnailUrl() != null) {
            room.setThumbnailUrl(request.thumbnailUrl());
        }

        Room updated = roomRepository.save(room);

        // Update gallery if provided
        List<String> galleryUrls = new ArrayList<>();
        if (request.gallery() != null) {
            roomImageRepository.deleteByRoomId(roomId);
            int order = 0;
            for (String imgUrl : request.gallery()) {
                if (imgUrl != null && !imgUrl.isBlank()) {
                    RoomImage img = new RoomImage();
                    img.setRoomId(roomId);
                    img.setImageUrl(imgUrl.trim());
                    img.setDisplayOrder(order++);
                    roomImageRepository.save(img);
                    galleryUrls.add(imgUrl.trim());
                }
            }
        } else {
            galleryUrls = roomImageRepository.findByRoomIdOrderByDisplayOrderAsc(roomId).stream()
                    .map(RoomImage::getImageUrl)
                    .toList();
        }

        // Update amenities if provided
        List<String> amenityNames = new ArrayList<>();
        if (request.amenities() != null) {
            roomAmenityRepository.deleteByRoomId(roomId);
            for (String name : request.amenities()) {
                if (name != null && !name.isBlank()) {
                    RoomAmenity amenity = new RoomAmenity();
                    amenity.setRoomId(roomId);
                    amenity.setAmenityName(name.trim());
                    roomAmenityRepository.save(amenity);
                    amenityNames.add(name.trim());
                }
            }
        } else {
            amenityNames = roomAmenityRepository.findByRoomId(roomId).stream()
                    .map(RoomAmenity::getAmenityName)
                    .toList();
        }

        return toInventoryResponse(updated, galleryUrls, amenityNames);
    }

    /**
     * Soft delete room from inventory.
     * Subtask: NIBM2-573, NIBM2-574
     */
    @Transactional
    public void softDeleteRoom(Long roomId) {
        Room room = roomRepository.findByIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RoomNotFoundException(roomId));
        room.setDeleted(true);
        room.setDeletedAt(LocalDateTime.now());
        roomRepository.save(room);
    }

    /**
     * List and search rooms in inventory with filters.
     * Subtask: NIBM2-564
     */
    @Transactional(readOnly = true)
    public List<RoomInventoryResponse> searchInventory(String query, String bedType,
                                                       BigDecimal minPrice, BigDecimal maxPrice,
                                                       Integer minOccupancy, String sort) {
        List<Room> rooms = roomRepository.searchInventory(query, bedType, minPrice, maxPrice, minOccupancy);

        if ("desc".equalsIgnoreCase(sort) || "high".equalsIgnoreCase(sort)) {
            rooms = rooms.stream()
                    .sorted(Comparator.comparing(Room::getPricePerNight).reversed())
                    .toList();
        }

        List<Long> roomIds = rooms.stream().map(Room::getId).toList();
        Map<Long, List<String>> amenitiesByRoom = roomAmenityRepository.findByRoomIdIn(roomIds).stream()
                .collect(Collectors.groupingBy(
                        RoomAmenity::getRoomId,
                        Collectors.mapping(RoomAmenity::getAmenityName, Collectors.toList())
                ));

        return rooms.stream()
                .map(r -> {
                    List<String> amenities = amenitiesByRoom.getOrDefault(r.getId(), List.of());
                    List<String> gallery = roomImageRepository.findByRoomIdOrderByDisplayOrderAsc(r.getId()).stream()
                            .map(RoomImage::getImageUrl)
                            .toList();
                    return toInventoryResponse(r, gallery, amenities);
                })
                .toList();
    }

    /**
     * Retrieve single room inventory details.
     */
    @Transactional(readOnly = true)
    public RoomInventoryResponse getRoomById(Long roomId) {
        Room room = roomRepository.findByIdAndDeletedFalse(roomId)
                .orElseThrow(() -> new RoomNotFoundException(roomId));
        List<String> gallery = roomImageRepository.findByRoomIdOrderByDisplayOrderAsc(roomId).stream()
                .map(RoomImage::getImageUrl)
                .toList();
        List<String> amenities = roomAmenityRepository.findByRoomId(roomId).stream()
                .map(RoomAmenity::getAmenityName)
                .toList();
        return toInventoryResponse(room, gallery, amenities);
    }

    private RoomInventoryResponse toInventoryResponse(Room room, List<String> gallery, List<String> amenities) {
        return new RoomInventoryResponse(
                room.getId(),
                room.getTitle(),
                room.getRoomNumber(),
                room.getRoomType(),
                room.getShortDescription(),
                room.getFullDescription(),
                room.getPricePerNight(),
                room.getMaxOccupancy(),
                room.getSizeSqm(),
                room.getBedCount(),
                room.getBedType(),
                room.getThumbnailUrl(),
                room.getAverageRating(),
                room.getReviewCount(),
                gallery,
                amenities,
                room.getCreatedAt()
        );
    }
}
