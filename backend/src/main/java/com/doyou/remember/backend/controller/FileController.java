package com.doyou.remember.backend.controller;

import com.doyou.remember.backend.domain.FileInfo;
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
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {
    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<List<FileInfo>> uploadFiles(@RequestParam("files") List<MultipartFile> files) {
        try {
            List<FileInfo> savedFiles = files.stream()
                .map(file -> {
                    try {
                        return fileService.saveFile(file);
                    } catch (IOException e) {
                        throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
                    }
                })
                .toList();
            return ResponseEntity.ok(savedFiles);
        } catch (Exception e) {
            throw new RuntimeException("파일 업로드에 실패했습니다.", e);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<FileInfo>> getAllFiles() {
        List<FileInfo> files = fileService.getAllFiles();
        return ResponseEntity.ok(files);
    }

    @GetMapping("/search")
    public ResponseEntity<List<FileInfo>> searchFiles(@RequestParam(required = false) Set<String> tags) {
        List<FileInfo> files = fileService.getAllFiles(); // TODO: 태그 기반 검색 구현
        return ResponseEntity.ok(files);
    }

    @GetMapping("/search/advanced")
    public ResponseEntity<List<FileInfo>> searchFiles(
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
                
        List<FileInfo> files = fileService.searchFiles(criteria);
        return ResponseEntity.ok(files);
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<Resource> serveFile(@PathVariable Long id) {
        Resource file = fileService.loadAsResource(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    @GetMapping("/{id}/metadata")
    public ResponseEntity<Map<String, Object>> getFileMetadata(@PathVariable Long id) {
        return ResponseEntity.ok(fileService.getFileMetadata(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FileInfo> getFileInfo(@PathVariable Long id) {
        return ResponseEntity.ok(fileService.getFileInfo(id));
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

    @PostMapping("/search/advanced")
    public ResponseEntity<List<FileInfo>> searchFiles(@RequestBody SearchCriteria criteria) {
        List<FileInfo> files = fileService.searchFiles(criteria);
        return ResponseEntity.ok(files);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFile(@PathVariable Long id) {
        try {
            fileService.deleteFile(id);
            return ResponseEntity.ok().build();
        } catch (IOException e) {
            log.error("파일 삭제 중 오류 발생", e);
            return ResponseEntity.internalServerError().build();
        }
    }
} 
