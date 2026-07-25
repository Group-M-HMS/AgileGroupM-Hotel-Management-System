package com.nibm.room_service.repository;

import com.nibm.room_service.entity.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {

    List<RoomImage> findByRoomIdOrderByDisplayOrderAsc(Long roomId);
    boolean existsByRoomId(Long roomId);
}
