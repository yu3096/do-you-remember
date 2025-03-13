package com.doyou.remember.backend.service;

import com.doyou.remember.backend.domain.Attachment;
import com.doyou.remember.backend.repository.AttachmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FileService {
    private final AttachmentRepository attachmentRepository;

    @Value("${file.upload.location}")
    private String uploadPath;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    @Transactional
    public Attachment upload(MultipartFile file) {
        validateFile(file);

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = getFileExtension(originalFilename);
            String storagePath = createStoragePath(originalFilename);
            Path targetLocation = Paths.get(uploadPath).resolve(storagePath);

            Files.createDirectories(targetLocation.getParent());
            Files.copy(file.getInputStream(), targetLocation);

            Attachment attachment = Attachment.builder()
                    .fileName(originalFilename)
                    .fileType(file.getContentType())
                    .fileSize(file.getSize())
                    .storagePath(storagePath)
                    .build();

            return attachmentRepository.save(attachment);
        } catch (IOException ex) {
            throw new RuntimeException("파일 업로드에 실패했습니다.", ex);
        }
    }

    public Resource loadAsResource(String filePath) {
        try {
            Path file = Paths.get(uploadPath).resolve(filePath);
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("파일을 읽을 수 없습니다: " + filePath);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("파일을 찾을 수 없습니다: " + filePath, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일입니다.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("파일 크기가 50MB를 초과합니다.");
        }

        String extension = getFileExtension(file.getOriginalFilename());
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다.");
        }
    }

    private String createStoragePath(String originalFilename) {
        LocalDate now = LocalDate.now();
        return String.format("%d/%02d/%02d/%s",
                now.getYear(), now.getMonthValue(), now.getDayOfMonth(),
                System.currentTimeMillis() + "_" + originalFilename);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new IllegalArgumentException("잘못된 파일 형식입니다.");
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }
} 
