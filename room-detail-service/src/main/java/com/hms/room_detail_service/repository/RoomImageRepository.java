package com.hms.room_detail_service.repository;

import com.hms.room_detail_service.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {

    List<RoomImage> findByRoomIdOrderByDisplayOrderAsc(Long roomId);
    boolean existsByRoomId(Long roomId);
}
