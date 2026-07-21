package com.nibm.room_service.service;

import com.nibm.room_service.dto.RoomResponse;
import com.nibm.room_service.dto.RoomSearchRequest;
import com.nibm.room_service.entity.Room;
import com.nibm.room_service.repository.RoomRepository;
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
