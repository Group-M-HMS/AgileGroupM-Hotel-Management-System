package com.nibm.hotel_management_system.controller;


import com.nibm.hotel_management_system.dto.RoomResponse;
import com.nibm.hotel_management_system.dto.RoomSearchRequest;
import com.nibm.hotel_management_system.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping("/search")
    public List<RoomResponse> searchRooms(@Valid RoomSearchRequest request) {
        return roomService.searchAvailableRooms(request);
    }
}