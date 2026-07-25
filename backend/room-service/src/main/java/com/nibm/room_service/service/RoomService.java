package com.nibm.room_service.service;

import com.nibm.room_service.dto.RoomResponse;
import com.nibm.room_service.dto.RoomSearchRequest;
import com.nibm.room_service.entity.Room;
import com.nibm.room_service.entity.RoomAmenity;
import com.nibm.room_service.repository.RoomAmenityRepository;
import com.nibm.room_service.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomAmenityRepository roomAmenityRepository;

    public RoomService(RoomRepository roomRepository, RoomAmenityRepository roomAmenityRepository) {
        this.roomRepository = roomRepository;
        this.roomAmenityRepository = roomAmenityRepository;
    }

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
}
