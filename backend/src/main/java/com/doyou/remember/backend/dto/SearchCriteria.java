package com.doyou.remember.backend.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Builder
public class SearchCriteria {
    private Set<String> tags;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String make;
    private String model;
    private String fNumber;
    private String exposureTime;
    private String isoSpeedRatings;
} 