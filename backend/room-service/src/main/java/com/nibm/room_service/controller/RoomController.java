package com.nibm.room_service.controller;

import com.nibm.room_service.dto.*;
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
@Tag(name = "Rooms", description = "Room inventory and availability operations")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    /**
     * Search available rooms for booking dates and guest capacity.
     */
    @Operation(summary = "Search available rooms for date range")
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
}
