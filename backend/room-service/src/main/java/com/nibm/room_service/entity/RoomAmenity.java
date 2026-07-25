package com.nibm.room_service.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "room_amenities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RoomAmenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "amenity_name", nullable = false, length = 255)
    private String amenityName;

}
