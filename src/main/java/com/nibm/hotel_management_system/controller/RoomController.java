package com.nibm.hotel_management_system.controller;

import com.nibm.hotel_management_system.dto.RoomResponse;
import com.nibm.hotel_management_system.dto.RoomSearchRequest;
import com.nibm.hotel_management_system.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Room search and availability")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @Operation(
            summary = "Search available rooms",
            description = "Returns rooms available for the given date range and guest count. " +
                    "Excludes rooms with an overlapping CONFIRMED booking. " +
                    "Check-in cannot be in the past, and check-out must be after check-in."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "List of available rooms returned successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request - e.g. check-out not after check-in, check-in in the past, or missing/invalid parameters")
    })
    @GetMapping("/search")
    public List<RoomResponse> searchRooms(@Valid RoomSearchRequest request) {
        return roomService.searchAvailableRooms(request);
    }
}