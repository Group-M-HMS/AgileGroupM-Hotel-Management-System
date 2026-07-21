package com.nibm.hotel_management_system.repository;

import com.nibm.hotel_management_system.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {

    @Query("""
        SELECT r FROM Room r
        WHERE r.maxOccupancy >= :guests
        AND r.id NOT IN (
            SELECT b.room.id FROM Booking b
            WHERE b.status = com.nibm.hotel_management_system.entity.Booking$BookingStatus.CONFIRMED
            AND b.checkIn < :checkOut AND b.checkOut > :checkIn
        )
        """)
    List<Room> findAvailableRooms(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("guests") Integer guests
    );
}