package com.doyou.remember.backend.service;

import com.doyou.remember.backend.domain.Album;
import com.doyou.remember.backend.domain.FileInfo;
import com.doyou.remember.backend.repository.AlbumRepository;
import com.doyou.remember.backend.repository.FileInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AlbumService {
    private final AlbumRepository albumRepository;
    private final FileInfoRepository fileInfoRepository;

    @Transactional
    public Album createAlbum(String title, String description, List<Long> fileIds) {
        Album album = new Album();
        album.setTitle(title);
        album.setDescription(description);

        List<FileInfo> files = fileInfoRepository.findAllById(fileIds);
        album.setFiles(files);
        album.setPhotoCount(files.size());
        
        if (!files.isEmpty()) {
            LocalDateTime earliestDate = files.stream()
                .map(FileInfo::getCreatedAt)
                .min(LocalDateTime::compareTo)
                .orElse(LocalDateTime.now());
            album.setStartDate(earliestDate);
        }

        return albumRepository.save(album);
    }

    @Transactional(readOnly = true)
    public List<Album> getAllAlbums() {
        return albumRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Album getAlbum(Long id) {
        return albumRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("앨범을 찾을 수 없습니다."));
    }

    @Transactional
    public void deleteAlbum(Long id) {
        albumRepository.deleteById(id);
    }

    @Transactional
    public Album updateAlbum(Long id, String title, String description, List<Long> fileIds) {
        Album album = getAlbum(id);
        album.setTitle(title);
        album.setDescription(description);

        if (fileIds != null) {
            List<FileInfo> files = fileInfoRepository.findAllById(fileIds);
            album.setFiles(files);
            album.setPhotoCount(files.size());
        }

        return albumRepository.save(album);
    }

    @Transactional
    public Album updateCoverImage(Long albumId, Long fileId, String position) {
        Album album = getAlbum(albumId);
        
        // 파일이 앨범에 포함되어 있는지 확인
        boolean fileExists = album.getFiles().stream()
            .anyMatch(file -> file.getId().equals(fileId));
            
        if (!fileExists) {
            throw new IllegalArgumentException("선택한 파일이 앨범에 포함되어 있지 않습니다.");
        }
        
        album.setCoverImageId(fileId);
        album.setCoverImagePosition(position);
        return albumRepository.save(album);
    }
} 