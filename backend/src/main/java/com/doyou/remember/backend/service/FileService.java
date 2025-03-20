package com.doyou.remember.backend.service;

import com.doyou.remember.backend.domain.Album;
import com.doyou.remember.backend.domain.FileInfo;
import com.doyou.remember.backend.domain.ExifData;
import com.doyou.remember.backend.dto.SearchCriteria;
import com.doyou.remember.backend.repository.FileInfoRepository;
import com.doyou.remember.backend.repository.ExifDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileService {
    private final FileInfoRepository fileInfoRepository;
    private final ExifDataRepository exifDataRepository;
    private final ExifService exifService;

    @Value("${file.upload.location}")
    private String uploadPath;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "gif");
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    @Transactional
    public FileInfo saveFile(MultipartFile file) throws IOException {
        validateFile(file);

        // 업로드 디렉토리 생성
        Path uploadDir = Paths.get(uploadPath);
        if (!Files.exists(uploadDir)) {
            Files.createDirectories(uploadDir);
        }

        // 파일 저장
        String originalFilename = file.getOriginalFilename();
        String storagePath = createStoragePath(originalFilename);
        Path filePath = uploadDir.resolve(storagePath);
        Files.copy(file.getInputStream(), filePath);

        // DB에 파일 정보 저장
        FileInfo fileInfo = new FileInfo();
        fileInfo.setFileName(originalFilename);
        fileInfo.setOriginalFileName(originalFilename);
        fileInfo.setStoragePath(storagePath);
        fileInfo.setFileSize(file.getSize());
        fileInfo.setFileType(file.getContentType());

        return fileInfoRepository.save(fileInfo);
    }

    @Transactional(readOnly = true)
    public List<FileInfo> getAllFiles() {
        return fileInfoRepository.findAllWithTags();
    }

    @Transactional(readOnly = true)
    public FileInfo getFile(Long id) {
        return fileInfoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다."));
    }

    @Transactional
    public void deleteFile(Long id) throws IOException {
        FileInfo fileInfo = getFile(id);
        Path filePath = Paths.get(uploadPath, fileInfo.getStoragePath());
        Files.deleteIfExists(filePath);
        fileInfoRepository.deleteById(id);
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
        String yearPath = String.format("%d", now.getYear());
        String monthPath = String.format("%02d", now.getMonthValue());
        String dayPath = String.format("%02d", now.getDayOfMonth());
        
        // 날짜별 폴더 구조 생성
        Path datePath = Paths.get(uploadPath, yearPath, monthPath, dayPath);
        try {
            Files.createDirectories(datePath);
        } catch (IOException e) {
            log.error("폴더 생성 중 오류 발생", e);
            throw new RuntimeException("폴더 생성에 실패했습니다.", e);
        }
        
        return String.format("%s/%s/%s/%s",
                yearPath, monthPath, dayPath,
                System.currentTimeMillis() + "_" + originalFilename);
    }

    private String getFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            throw new IllegalArgumentException("잘못된 파일 형식입니다.");
        }
        return fileName.substring(fileName.lastIndexOf(".") + 1);
    }

    private boolean isImageFile(String extension) {
        return extension.toLowerCase().matches("jpg|jpeg|png");
    }

    @Transactional(readOnly = true)
    public ExifData getExifData(Long fileId) {
        return exifDataRepository.findById(fileId)
                .orElse(null);
    }

    public List<FileInfo> searchFiles(SearchCriteria criteria) {
        // TODO: 검색 기능 구현
        return fileInfoRepository.findAll();
    }

    public List<Album> generateAlbums(String groupBy, Integer minPhotos) {
        List<FileInfo> allFiles = fileInfoRepository.findAll();
        int minimumPhotos = minPhotos != null ? minPhotos : 3;
        
        if (groupBy == null || groupBy.equals("date")) {
            return generateDateBasedAlbums(allFiles, minimumPhotos);
        } else if (groupBy.equals("tag")) {
            return generateTagBasedAlbums(allFiles, minimumPhotos);
        } else if (groupBy.equals("location")) {
            return generateLocationBasedAlbums(allFiles, minimumPhotos);
        }
        
        return generateDateBasedAlbums(allFiles, minimumPhotos);
    }

    private List<Album> generateDateBasedAlbums(List<FileInfo> files, int minimumPhotos) {
        Map<LocalDate, List<FileInfo>> filesByDate = files.stream()
            .collect(Collectors.groupingBy(
                file -> file.getCreatedAt().toLocalDate()
            ));
        
        return filesByDate.entrySet().stream()
            .filter(entry -> entry.getValue().size() >= minimumPhotos)
            .map(entry -> {
                Album album = new Album();
                album.setTitle(entry.getKey().format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일")));
                album.setDescription(String.format("%d개의 사진", entry.getValue().size()));
                album.setFiles(entry.getValue());
                album.setPhotoCount(entry.getValue().size());
                
                // 첫 번째 이미지를 커버 이미지로 설정
                if (!entry.getValue().isEmpty()) {
                    album.setCoverImageId(entry.getValue().get(0).getId());
                }
                
                return album;
            })
            .sorted((a1, a2) -> a2.getCreatedAt().compareTo(a1.getCreatedAt()))
            .collect(Collectors.toList());
    }

    private List<Album> generateTagBasedAlbums(List<FileInfo> files, int minimumPhotos) {
        // TODO: 태그 기반 앨범 생성 구현
        return new ArrayList<>();
    }

    private List<Album> generateLocationBasedAlbums(List<FileInfo> files, int minimumPhotos) {
        // TODO: 위치 기반 앨범 생성 구현
        return new ArrayList<>();
    }

    public Resource loadAsResource(Long id) {
        FileInfo fileInfo = fileInfoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다: " + id));
        return loadAsResource(fileInfo.getStoragePath());
    }

    public Map<String, Object> getFileMetadata(Long id) {
        FileInfo fileInfo = fileInfoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다: " + id));
        try {
            Path filePath = Paths.get(uploadPath, fileInfo.getStoragePath());
            return exifService.extractExifData(filePath.toFile());
        } catch (Exception e) {
            log.error("메타데이터를 읽는 중 오류가 발생했습니다", e);
            return Map.of();
        }
    }

    public FileInfo getFileInfo(Long id) {
        return fileInfoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("파일을 찾을 수 없습니다: " + id));
    }
} 
