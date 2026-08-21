package com.nibm.room_service.repository;

import com.nibm.room_service.entity.RoomAmenity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomAmenityRepository extends JpaRepository<RoomAmenity, Long> {

    List<RoomAmenity> findByRoomId(Long roomId);
    boolean existsByRoomId(Long roomId);
    List<RoomAmenity> findByRoomIdIn(List<Long> roomIds);
    void deleteByRoomId(Long roomId);
}
