package com.nibm.room_service.controller;

import com.nibm.room_service.dto.RoomStatusSummary;
import com.nibm.room_service.dto.RoomStatusUpdateRequest;
import com.nibm.room_service.dto.RoomStatusUpdateResponse;
import com.nibm.room_service.entity.Room;
import com.nibm.room_service.repository.RoomRepository;
import com.nibm.room_service.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.List;

/**
 * Service-to-service endpoints for booking-service. Not under /api/rooms/** or /api/admin/**, so
 * SecurityConfig leaves them to the X-Internal-Secret check here (same pattern as booking-service's
 * /api/v1/bookings/internal).
 */
@RestController
@RequestMapping("/api/internal/rooms")
@Tag(name = "Rooms (Internal)", description = "Service-to-service endpoints, not customer-facing")
public class RoomInternalController {

    private final RoomRepository roomRepository;
    private final RoomService roomService;
    private final byte[] internalSecret;

    public RoomInternalController(RoomRepository roomRepository,
                                  RoomService roomService,
                                  @Value("${internal.service-secret}") String internalSecret) {
        this.roomRepository = roomRepository;
        this.roomService = roomService;
        this.internalSecret = internalSecret.getBytes(StandardCharsets.UTF_8);
    }

    @Operation(summary = "[internal] Every room with its operational status")
    @GetMapping
    public List<RoomStatusSummary> listRooms(
            @RequestHeader(value = "X-Internal-Secret", required = false) String providedSecret) {
        requireValidInternalSecret(providedSecret);
        return roomRepository.findAllByDeletedFalseOrderByPricePerNightAsc().stream()
                .map(RoomInternalController::toSummary)
                .toList();
    }

    @Operation(summary = "[internal] Sync room status after a booking check-in/out/cancel")
    @PatchMapping("/{id}/status")
    public RoomStatusUpdateResponse updateStatus(
            @RequestHeader(value = "X-Internal-Secret", required = false) String providedSecret,
            @PathVariable Long id,
            @Valid @RequestBody RoomStatusUpdateRequest request) {
        requireValidInternalSecret(providedSecret);
        return roomService.updateRoomStatus(id, request);
    }

    private static RoomStatusSummary toSummary(Room r) {
        return new RoomStatusSummary(r.getId(), r.getRoomNumber(), r.getTitle(), r.getBedType(),
                r.getRoomType(), r.getStatus());
    }

    private void requireValidInternalSecret(String provided) {
        // Fail closed: a blank configured secret must never match a blank header.
        if (internalSecret.length == 0 || provided == null
                || !MessageDigest.isEqual(provided.getBytes(StandardCharsets.UTF_8), internalSecret)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid internal service credentials");
        }
    }
}
