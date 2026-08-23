package com.nibm.room_service.repository;

import com.nibm.room_service.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoomRepository extends JpaRepository<Room, Long> {

    Optional<Room> findByIdAndDeletedFalse(Long id);

    List<Room> findAllByDeletedFalseOrderByPricePerNightAsc();

    @Query("""
        SELECT r FROM Room r
        WHERE r.deleted = false
        AND r.maxOccupancy >= :guests
        AND r.id NOT IN (
            SELECT b.room.id FROM Booking b
            WHERE b.status = com.nibm.room_service.entity.Booking$BookingStatus.CONFIRMED
            AND b.checkIn < :checkOut AND b.checkOut > :checkIn
        )
        """)
    List<Room> findAvailableRooms(
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("guests") Integer guests
    );

    @Query("""
        SELECT r FROM Room r
        WHERE r.deleted = false
        AND (:query IS NULL OR :query = '' OR
             LOWER(r.title) LIKE LOWER(CONCAT('%', :query, '%')) OR
             LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR
             LOWER(r.bedType) LIKE LOWER(CONCAT('%', :query, '%')) OR
             LOWER(r.roomType) LIKE LOWER(CONCAT('%', :query, '%')))
        AND (:bedType IS NULL OR :bedType = '' OR LOWER(r.bedType) LIKE LOWER(CONCAT('%', :bedType, '%')))
        AND (:minPrice IS NULL OR r.pricePerNight >= :minPrice)
        AND (:maxPrice IS NULL OR r.pricePerNight <= :maxPrice)
        AND (:minOccupancy IS NULL OR r.maxOccupancy >= :minOccupancy)
        ORDER BY r.pricePerNight ASC
        """)
    List<Room> searchInventory(
            @Param("query") String query,
            @Param("bedType") String bedType,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minOccupancy") Integer minOccupancy
    );
}
