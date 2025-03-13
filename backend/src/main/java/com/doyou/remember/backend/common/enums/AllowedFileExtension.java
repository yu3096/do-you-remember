package com.doyou.remember.backend.common.enums;

import lombok.Getter;

import java.util.Arrays;
import java.util.List;

@Getter
public enum AllowedFileExtension {
    // ?지
    JPG("image/jpeg", Arrays.asList(".jpg", ".jpeg")),
    PNG("image/png", List.of(".png")),
    GIF("image/gif", List.of(".gif")),
    
    // 문서
    PDF("application/pdf", List.of(".pdf")),
    DOC("application/msword", List.of(".doc")),
    DOCX("application/vnd.openxmlformats-officedocument.wordprocessingml.document", List.of(".docx")),
    
    // ?스
    TXT("text/plain", List.of(".txt")),
    BMP("image/bmp", List.of(".bmp")),
    WEBP("image/webp", List.of(".webp"));

    private final String mimeType;
    private final List<String> extensions;

    AllowedFileExtension(String mimeType, List<String> extensions) {
        this.mimeType = mimeType;
        this.extensions = extensions;
    }

    public static boolean isAllowed(String fileName, String contentType) {
        String extension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
        return Arrays.stream(values())
                .anyMatch(allowed -> 
                    allowed.getExtensions().contains(extension) && 
                    allowed.getMimeType().equals(contentType)
                );
    }

    public static boolean contains(String extension) {
        try {
            valueOf(extension.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
} 
