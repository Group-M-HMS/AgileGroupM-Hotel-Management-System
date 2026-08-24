package com.nibm.room_service.controller;

import com.nibm.room_service.dto.*;
import com.nibm.room_service.entity.AdminAuditLog;
import com.nibm.room_service.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@Tag(name = "Rooms", description = "Room inventory, search, availability, and status management")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    /**
     * Search available rooms for booking dates and guest capacity.
     */
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
     * List and filter rooms in hotel inventory.
     * Subtask: NIBM2-564
     */
    @Operation(summary = "List and filter room inventory")
    @GetMapping
    public List<RoomInventoryResponse> listInventory(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "search", required = false) String search,
            @RequestParam(name = "bedType", required = false) String bedType,
            @RequestParam(name = "minPrice", required = false) BigDecimal minPrice,
            @RequestParam(name = "maxPrice", required = false) BigDecimal maxPrice,
            @RequestParam(name = "minOccupancy", required = false) Integer minOccupancy,
            @RequestParam(name = "sort", required = false) String sort) {
        String query = q != null ? q : search;
        return roomService.searchInventory(query, bedType, minPrice, maxPrice, minOccupancy, sort);
    }

    /**
     * Create a new room in catalog.
     * Subtask: NIBM2-573, NIBM2-574
     */
    @Operation(summary = "Create a new room in inventory")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public RoomInventoryResponse createRoom(@Valid @RequestBody RoomCreateRequest request) {
        return roomService.createRoom(request);
    }

    /**
     * Update room pricing, capacity, and details.
     * Subtask: NIBM2-570, NIBM2-617
     */
    @Operation(summary = "Update an existing room in inventory")
    @PutMapping("/{id}")
    public RoomInventoryResponse updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomUpdateRequest request) {
        return roomService.updateRoom(id, request);
    }

    /**
     * Soft-delete room from inventory.
     * Subtask: NIBM2-573, NIBM2-574
     */
    @Operation(summary = "Soft-delete a room from inventory")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRoom(@PathVariable Long id) {
        roomService.softDeleteRoom(id);
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
