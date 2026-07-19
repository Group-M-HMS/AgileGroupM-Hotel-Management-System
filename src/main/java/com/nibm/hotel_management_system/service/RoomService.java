package com.nibm.hotel_management_system.service;

import com.nibm.hotel_management_system.dto.RoomResponse;
import com.nibm.hotel_management_system.dto.RoomSearchRequest;
import com.nibm.hotel_management_system.entity.Room;
import com.nibm.hotel_management_system.repository.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<RoomResponse> searchAvailableRooms(RoomSearchRequest request) {
        List<Room> rooms = roomRepository.findAvailableRooms(
                request.getCheckIn(), request.getCheckOut(), request.getGuests()
        );

        return rooms.stream()
                .map(r -> new RoomResponse(r.getId(), r.getTitle(), r.getThumbnailUrl(),
                        r.getPricePerNight(), r.getMaxOccupancy()))
                .toList();
    }
}
