package com.doyou.remember.backend.controller;

import com.doyou.remember.backend.domain.Attachment;
import com.doyou.remember.backend.domain.ExifData;
import com.doyou.remember.backend.dto.SearchCriteria;
import com.doyou.remember.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.format.annotation.DateTimeFormat;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Set;
import java.time.LocalDate;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<List<Attachment>> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
        List<Attachment> attachments = fileService.uploadMultiple(files);
        return ResponseEntity.ok(attachments);
    }

    @GetMapping("/list")
    public ResponseEntity<List<Attachment>> getFileList() {
        List<Attachment> files = fileService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Attachment>> searchFilesByTags(@RequestParam(required = false) Set<String> tags) {
        List<Attachment> files = fileService.getFilesByTags(tags);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/search/advanced")
    public ResponseEntity<List<Attachment>> searchFiles(
            @RequestParam(required = false) Set<String> tags,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate endDate,
            @RequestParam(required = false) String make,
            @RequestParam(required = false) String model,
            @RequestParam(required = false) String fNumber,
            @RequestParam(required = false) String exposureTime,
            @RequestParam(required = false) String isoSpeedRatings) {
        
        SearchCriteria criteria = SearchCriteria.builder()
                .tags(tags)
                .startDate(startDate != null ? startDate.atStartOfDay() : null)
                .endDate(endDate != null ? endDate.plusDays(1).atStartOfDay() : null)
                .make(make)
                .model(model)
                .fNumber(fNumber)
                .exposureTime(exposureTime)
                .isoSpeedRatings(isoSpeedRatings)
                .build();
                
        List<Attachment> files = fileService.searchFiles(criteria);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{year}/{month}/{day}/{fileName}")
    public ResponseEntity<Resource> serveFile(
            @PathVariable String year,
            @PathVariable String month,
            @PathVariable String day,
            @PathVariable String fileName) {
        String filePath = String.format("%s/%s/%s/%s", year, month, day, fileName);
        Resource file = fileService.loadAsResource(filePath);

        String encodedFileName = URLEncoder.encode(fileName, StandardCharsets.UTF_8)
                .replaceAll("\\+", "%20");

        String contentType = getContentType(fileName);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFileName + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(file);
    }

    @GetMapping("/{id}/exif")
    public ResponseEntity<ExifData> getExifData(@PathVariable Long id) {
        ExifData exifData = fileService.getExifData(id);
        if (exifData == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(exifData);
    }

    private String getContentType(String fileName) {
        String extension = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            default:
                return "application/octet-stream";
        }
    }
} 
