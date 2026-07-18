package com.hms.room_detail_service.controller;

import com.hms.room_detail_service.dto.RoomAmenityDto;
import com.hms.room_detail_service.dto.RoomDetailResponse;
import com.hms.room_detail_service.dto.RoomImageDto;
import com.hms.room_detail_service.service.RoomDetailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/rooms")
@Tag(name = "Room Detail Service", description = "Answers: what is this room?")
public class RoomDetailController {
    private final RoomDetailService roomDetailService;

    public RoomDetailController(RoomDetailService roomDetailService) {
        this.roomDetailService = roomDetailService;
    }

    @GetMapping("/{roomId}")
    @Operation(summary = "Get full room details (description, occupancy, images, amenities)")
    public ResponseEntity<RoomDetailResponse> getRoomDetails(@PathVariable Long roomId) {
        return ResponseEntity.ok(roomDetailService.getRoomDetail(roomId));
    }

    @GetMapping("/{roomId}/images")
    @Operation(summary = "Get images for a room, ordered for gallery display")
    public ResponseEntity<Map<String, List<RoomImageDto>>> getRoomImages(@PathVariable Long roomId) {
        return ResponseEntity.ok(Map.of("images", roomDetailService.getRoomImages(roomId)));
    }

    @GetMapping("/{roomId}/amenities")
    @Operation(summary = "Get amenities for a room")
    public ResponseEntity<Map<String, List<RoomAmenityDto>>> getRoomAmenities(@PathVariable Long roomId) {
        return ResponseEntity.ok(Map.of("amenities", roomDetailService.getRoomAmenities(roomId)));
    }
}
