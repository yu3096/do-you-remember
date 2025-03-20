package com.doyou.remember.backend.domain;

import jakarta.persistence.*;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonBackReference;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Entity
@Getter
@NoArgsConstructor
public class ExifData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "attachment_id")
    @JsonBackReference
    private Attachment attachment;

    private String make;              // 카메라 제조사
    private String model;             // 카메라 모델
    
    @Column(name = "date_time")
    private LocalDateTime dateTime;   // 촬영 일시
    
    private String exposureTime;      // 노출 시간
    private String fNumber;           // F값
    private String isoSpeedRatings;   // ISO 감도
    private String focalLength;       // 초점 거리
    private Double latitude;          // 위도
    private Double longitude;         // 경도
    private Integer imageWidth;       // 이미지 너비
    private Integer imageHeight;      // 이미지 높이

    @Builder
    public ExifData(Attachment attachment, String make, String model, String dateTimeStr,
                   String exposureTime, String fNumber, String isoSpeedRatings,
                   String focalLength, Double latitude, Double longitude,
                   Integer imageWidth, Integer imageHeight) {
        this.attachment = attachment;
        this.make = make;
        this.model = model;
        this.dateTime = dateTimeStr != null ? LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ofPattern("yyyy:MM:dd HH:mm:ss")) : null;
        this.exposureTime = exposureTime;
        this.fNumber = fNumber;
        this.isoSpeedRatings = isoSpeedRatings;
        this.focalLength = focalLength;
        this.latitude = latitude;
        this.longitude = longitude;
        this.imageWidth = imageWidth;
        this.imageHeight = imageHeight;
    }

    public void setAttachment(Attachment attachment) {
        this.attachment = attachment;
    }

    public String getLocation() {
        if (latitude == null || longitude == null) {
            return null;
        }
        return String.format("%.6f,%.6f", latitude, longitude);
    }
} 