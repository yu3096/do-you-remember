package com.doyou.remember.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateCoverImageRequest {
    private Long fileId;
    
    @JsonProperty("position")
    private String position;
} 