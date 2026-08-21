package com.nibm.room_service.service;

import com.nibm.room_service.dto.RoomResponse;
import com.nibm.room_service.dto.RoomSearchRequest;
import com.nibm.room_service.dto.RoomStatusUpdateRequest;
import com.nibm.room_service.dto.RoomStatusUpdateResponse;
import com.nibm.room_service.entity.AdminAuditLog;
import com.nibm.room_service.entity.Room;
import com.nibm.room_service.entity.RoomAmenity;
import com.nibm.room_service.entity.RoomStatus;
import com.nibm.room_service.exception.RoomNotFoundException;
import com.nibm.room_service.repository.AdminAuditLogRepository;
import com.nibm.room_service.repository.RoomAmenityRepository;
import com.nibm.room_service.repository.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomAmenityRepository roomAmenityRepository;
    private final AdminAuditLogRepository adminAuditLogRepository;

    public RoomService(RoomRepository roomRepository,
                       RoomAmenityRepository roomAmenityRepository,
                       AdminAuditLogRepository adminAuditLogRepository) {
        this.roomRepository = roomRepository;
        this.roomAmenityRepository = roomAmenityRepository;
        this.adminAuditLogRepository = adminAuditLogRepository;
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

    /**
     * Updates a room's operational/housekeeping status and logs the transition in admin_audit_logs.
     * Subtask: NIBM2-567, NIBM2-555, NIBM2-616, NIBM2-608
     */
    @Transactional
    public RoomStatusUpdateResponse updateRoomStatus(Long roomId, RoomStatusUpdateRequest request) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RoomNotFoundException(roomId));

        RoomStatus oldStatus = room.getStatus() != null ? room.getStatus() : RoomStatus.AVAILABLE;
        RoomStatus newStatus = request.status();

        room.setStatus(newStatus);
        if (newStatus == RoomStatus.OCCUPIED) {
            room.setGuestName(request.guestName() != null && !request.guestName().isBlank()
                    ? request.guestName().trim()
                    : "Walk-in Guest");
        } else {
            room.setGuestName(null);
        }

        Room saved = roomRepository.save(room);

        // Record status change in admin_audit_logs
        AdminAuditLog auditLog = new AdminAuditLog();
        auditLog.setEntityType("ROOM");
        auditLog.setEntityId(String.valueOf(roomId));
        auditLog.setAction("STATUS_CHANGE");
        auditLog.setOldStatus(oldStatus.name());
        auditLog.setNewStatus(newStatus.name());
        auditLog.setChangedBy(request.changedBy() != null && !request.changedBy().isBlank()
                ? request.changedBy().trim()
                : "ADMIN");
        auditLog.setRemarks(request.remarks());
        auditLog.setTimestamp(LocalDateTime.now());
        adminAuditLogRepository.save(auditLog);

        return new RoomStatusUpdateResponse(
                saved.getId(),
                saved.getRoomNumber(),
                saved.getTitle(),
                oldStatus,
                newStatus,
                saved.getGuestName(),
                auditLog.getChangedBy(),
                auditLog.getRemarks(),
                auditLog.getTimestamp()
        );
    }

    /**
     * Retrieve status transition audit history for a specific room.
     */
    @Transactional(readOnly = true)
    public List<AdminAuditLog> getRoomAuditLogs(Long roomId) {
        return adminAuditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc("ROOM", String.valueOf(roomId));
    }
}
