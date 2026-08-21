package com.nibm.room_service.controller;

import com.nibm.room_service.dto.RoomResponse;
import com.nibm.room_service.dto.RoomSearchRequest;
import com.nibm.room_service.dto.RoomStatusUpdateRequest;
import com.nibm.room_service.dto.RoomStatusUpdateResponse;
import com.nibm.room_service.entity.AdminAuditLog;
import com.nibm.room_service.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Room search, availability, and status management")
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

    /**
     * Update operational/housekeeping status of a room with audit logging.
     * Subtask: NIBM2-567, NIBM2-555, NIBM2-616, NIBM2-608
     */
    @Operation(summary = "Update room status (Available, Occupied, Cleaning, Maintenance)")
    @PatchMapping("/{id}/status")
    public RoomStatusUpdateResponse updateRoomStatus(
            @PathVariable Long id,
            @Valid @RequestBody RoomStatusUpdateRequest request) {
        return roomService.updateRoomStatus(id, request);
    }

    /**
     * Fetch status transition history for a room.
     */
    @Operation(summary = "Get room status audit history")
    @GetMapping("/{id}/audit-logs")
    public List<AdminAuditLog> getRoomAuditLogs(@PathVariable Long id) {
        return roomService.getRoomAuditLogs(id);
    }
}
