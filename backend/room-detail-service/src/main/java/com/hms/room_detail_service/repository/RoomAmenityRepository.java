package com.hms.room_detail_service.repository;

import com.hms.room_detail_service.entity.RoomAmenity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomAmenityRepository extends JpaRepository<RoomAmenity, Long> {

    List<RoomAmenity> findByRoomId(Long roomId);
    boolean existsByRoomId(Long roomId);
}
