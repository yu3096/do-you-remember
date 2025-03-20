package com.doyou.remember.backend.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.imaging.ImageProcessingException;
import com.drew.metadata.Directory;
import com.drew.metadata.MetadataException;
import com.drew.metadata.Metadata;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import com.drew.metadata.jpeg.JpegDirectory;
import com.doyou.remember.backend.domain.Attachment;
import com.doyou.remember.backend.domain.ExifData;
import com.doyou.remember.backend.repository.ExifDataRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.io.File;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExifService {
    private final ExifDataRepository exifDataRepository;

    @Transactional
    public ExifData extractAndSaveExifData(MultipartFile file, Attachment attachment) {
        try {
            Metadata metadata = ImageMetadataReader.readMetadata(file.getInputStream());
            
            ExifData.ExifDataBuilder builder = ExifData.builder()
                    .attachment(attachment);

            // 기본 EXIF 정보 추출
            Optional.ofNullable(metadata.getFirstDirectoryOfType(ExifIFD0Directory.class))
                    .ifPresent(directory -> {
                        builder.make(getTagValue(directory, ExifIFD0Directory.TAG_MAKE));
                        builder.model(getTagValue(directory, ExifIFD0Directory.TAG_MODEL));
                        builder.dateTimeStr(getTagValue(directory, ExifIFD0Directory.TAG_DATETIME));
                    });

            // 상세 EXIF 정보 추출
            Optional.ofNullable(metadata.getFirstDirectoryOfType(ExifSubIFDDirectory.class))
                    .ifPresent(directory -> {
                        builder.exposureTime(getTagValue(directory, ExifSubIFDDirectory.TAG_EXPOSURE_TIME));
                        builder.fNumber(getTagValue(directory, ExifSubIFDDirectory.TAG_FNUMBER));
                        builder.isoSpeedRatings(getTagValue(directory, ExifSubIFDDirectory.TAG_ISO_EQUIVALENT));
                        builder.focalLength(getTagValue(directory, ExifSubIFDDirectory.TAG_FOCAL_LENGTH));
                    });

            // GPS 정보 추출
            Optional.ofNullable(metadata.getFirstDirectoryOfType(GpsDirectory.class))
                    .ifPresent(directory -> {
                        try {
                            if (directory.containsTag(GpsDirectory.TAG_LATITUDE) && 
                                directory.containsTag(GpsDirectory.TAG_LONGITUDE)) {
                                builder.latitude(directory.getGeoLocation().getLatitude());
                                builder.longitude(directory.getGeoLocation().getLongitude());
                            }
                        } catch (Exception e) {
                            log.warn("GPS 정보 추출 중 오류 발생: {}", e.getMessage());
                        }
                    });

            // 이미지 크기 정보 추출
            Optional.ofNullable(metadata.getFirstDirectoryOfType(JpegDirectory.class))
                    .ifPresent(directory -> {
                        try {
                            builder.imageWidth(directory.getImageWidth());
                            builder.imageHeight(directory.getImageHeight());
                        } catch (MetadataException e) {
                            log.warn("이미지 크기 정보 추출 중 오류 발생: {}", e.getMessage());
                        }
                    });

            ExifData exifData = builder.build();
            return exifDataRepository.save(exifData);
        } catch (ImageProcessingException | IOException e) {
            log.error("EXIF 데이터 추출 중 오류 발생: {}", e.getMessage());
            return null;
        }
    }

    private String getTagValue(Directory directory, int tagType) {
        try {
            if (directory.containsTag(tagType)) {
                return directory.getDescription(tagType);
            }
        } catch (Exception e) {
            log.warn("태그 값 추출 중 오류 발생: tagType={}, error={}", tagType, e.getMessage());
        }
        return null;
    }

    public Map<String, Object> extractExifData(File file) {
        try {
            // TODO: 실제 EXIF 데이터 추출 로직 구현
            return new HashMap<>();
        } catch (Exception e) {
            log.error("EXIF 데이터 추출 중 오류 발생", e);
            return Map.of();
        }
    }
} 