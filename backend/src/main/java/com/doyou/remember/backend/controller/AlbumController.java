package com.doyou.remember.backend.controller;

import com.doyou.remember.backend.domain.Album;
import com.doyou.remember.backend.service.AlbumService;
import com.doyou.remember.backend.dto.UpdateCoverImageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/files/albums")
@RequiredArgsConstructor
public class AlbumController {
    private final AlbumService albumService;

    @PostMapping
    public ResponseEntity<Album> createAlbum(@RequestBody Map<String, Object> request) {
        String title = (String) request.get("title");
        String description = (String) request.get("description");
        @SuppressWarnings("unchecked")
        List<Long> fileIds = (List<Long>) request.get("fileIds");

        Album album = albumService.createAlbum(title, description, fileIds);
        return ResponseEntity.ok(album);
    }

    @GetMapping
    public ResponseEntity<List<Album>> getAllAlbums() {
        List<Album> albums = albumService.getAllAlbums();
        return ResponseEntity.ok(albums);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Album> getAlbum(@PathVariable Long id) {
        Album album = albumService.getAlbum(id);
        return ResponseEntity.ok(album);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        albumService.deleteAlbum(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Album> updateAlbum(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        String title = (String) request.get("title");
        String description = (String) request.get("description");
        @SuppressWarnings("unchecked")
        List<Long> fileIds = (List<Long>) request.get("fileIds");

        Album album = albumService.updateAlbum(id, title, description, fileIds);
        return ResponseEntity.ok(album);
    }

    @PutMapping("/{id}/cover")
    public ResponseEntity<Album> updateCoverImage(
            @PathVariable Long id,
            @RequestBody UpdateCoverImageRequest request) {
        Album album = albumService.updateCoverImage(id, request.getFileId(), request.getPosition());
        return ResponseEntity.ok(album);
    }
} 