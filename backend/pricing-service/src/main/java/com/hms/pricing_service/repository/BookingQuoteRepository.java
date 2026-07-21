package com.hms.pricing_service.repository;

import com.hms.pricing_service.entity.BookingQuote;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingQuoteRepository extends JpaRepository<BookingQuote, Long> {
    List<BookingQuote> findByRoomId(Long roomId);
}
