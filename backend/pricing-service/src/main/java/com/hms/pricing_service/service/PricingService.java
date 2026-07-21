package com.hms.pricing_service.service;

import com.hms.pricing_service.client.RoomServiceClient;
import com.hms.pricing_service.dto.QuoteRequest;
import com.hms.pricing_service.dto.QuoteResponse;
import com.hms.pricing_service.dto.RoomBasicInfo;
import com.hms.pricing_service.dto.RoomPriceResponse;
import com.hms.pricing_service.entity.BookingQuote;
import com.hms.pricing_service.entity.PricingRule;
import com.hms.pricing_service.exception.InvalidDateRangeException;
import com.hms.pricing_service.exception.PricingRuleNotConfiguredException;
import com.hms.pricing_service.repository.BookingQuoteRepository;
import com.hms.pricing_service.repository.PricingRuleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Service
public class PricingService {
    private static final int MONEY_SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final RoomServiceClient roomServiceClient;
    private final PricingRuleRepository pricingRuleRepository;
    private final BookingQuoteRepository bookingQuoteRepository;

    public PricingService(RoomServiceClient roomServiceClient,
                          PricingRuleRepository pricingRuleRepository,
                          BookingQuoteRepository bookingQuoteRepository) {
        this.roomServiceClient = roomServiceClient;
        this.pricingRuleRepository = pricingRuleRepository;
        this.bookingQuoteRepository = bookingQuoteRepository;
    }

    /**
     * NIBM2-244 (subtotal), NIBM2-246 (tax), NIBM2-251 (persist breakdown),
     * NIBM2-402 (currency-safe rounding) all meet here.
     */
    @Transactional
    public QuoteResponse calculateQuote(QuoteRequest request) {
        int nights = calculateNights(request.checkIn(), request.checkOut());

        RoomBasicInfo room = roomServiceClient.getRoomBasicInfo(request.roomId());
        BigDecimal nightlyRate = room.basePrice().setScale(MONEY_SCALE, ROUNDING);

        BigDecimal subtotal = nightlyRate
                .multiply(BigDecimal.valueOf(nights))
                .setScale(MONEY_SCALE, ROUNDING);

        BigDecimal taxRate = getActiveTaxRate();
        BigDecimal tax = subtotal.multiply(taxRate).setScale(MONEY_SCALE, ROUNDING);

        BigDecimal total = subtotal.add(tax).setScale(MONEY_SCALE, ROUNDING);

        persistQuote(request, nights, nightlyRate, subtotal, taxRate, tax, total);

        return new QuoteResponse(nightlyRate, nights, subtotal, tax, total);
    }

    /**
     * NIBM2-398: current nightly rate for a room, for display on the room details page.
     */
    public RoomPriceResponse getCurrentRoomPrice(Long roomId) {
        RoomBasicInfo room = roomServiceClient.getRoomBasicInfo(roomId);
        BigDecimal nightlyRate = room.basePrice().setScale(MONEY_SCALE, ROUNDING);
        return new RoomPriceResponse(roomId, nightlyRate);
    }

    private int calculateNights(LocalDate checkIn, LocalDate checkOut) {
        if (!checkOut.isAfter(checkIn)) {
            throw new InvalidDateRangeException("check_out must be after check_in");
        }
        long nights = ChronoUnit.DAYS.between(checkIn, checkOut);
        return Math.toIntExact(nights);
    }

    private BigDecimal getActiveTaxRate() {
        PricingRule rule = pricingRuleRepository.findTopByOrderByCreatedAtDesc()
                .orElseThrow(PricingRuleNotConfiguredException::new);
        return rule.getTaxRate();
    }

    private void persistQuote(QuoteRequest request, int nights, BigDecimal nightlyRate,
                              BigDecimal subtotal, BigDecimal taxRate, BigDecimal tax, BigDecimal total) {
        BookingQuote quote = new BookingQuote();
        quote.setRoomId(request.roomId());
        quote.setCheckInDate(request.checkIn());
        quote.setCheckOutDate(request.checkOut());
        quote.setNights(nights);
        quote.setNightlyRate(nightlyRate);
        quote.setSubtotal(subtotal);
        quote.setTaxRate(taxRate);
        quote.setTax(tax);
        quote.setTotal(total);
        bookingQuoteRepository.save(quote);
    }
}
