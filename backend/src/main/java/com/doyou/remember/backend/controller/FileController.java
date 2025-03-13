package com.doyou.remember.backend.controller;

import com.doyou.remember.backend.domain.Attachment;
import com.doyou.remember.backend.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<Attachment> uploadFile(@RequestParam("file") MultipartFile file) {
        Attachment attachment = fileService.upload(file);
        return ResponseEntity.ok(attachment);
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

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + encodedFileName + "\"")
                .contentType(MediaType.parseMediaType("image/*"))
                .body(file);
    }
} 
