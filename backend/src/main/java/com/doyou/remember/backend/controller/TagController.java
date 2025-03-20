package com.doyou.remember.backend.controller;

import com.doyou.remember.backend.domain.Tag;
import com.doyou.remember.backend.service.TagService;
import com.doyou.remember.backend.dto.TagRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/files")
@RequiredArgsConstructor
@Slf4j
public class TagController {
    private final TagService tagService;

    @GetMapping("/{id}/tags")
    public ResponseEntity<Set<Tag>> getFileTags(@PathVariable Long id) {
        log.info("Getting tags for file: {}", id);
        return ResponseEntity.ok(tagService.getTagsByAttachment(id));
    }

    @PostMapping("/{id}/tags")
    public ResponseEntity<Void> addTagToFile(
            @PathVariable Long id,
            @RequestBody TagRequest tagRequest) {
        log.info("Adding tag: {} to file: {}", tagRequest.name(), id);
        tagService.addTagsToAttachment(id, Set.of(tagRequest.name()));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/tags/{tagId}")
    public ResponseEntity<Void> removeTagFromFile(
            @PathVariable Long id,
            @PathVariable Long tagId) {
        log.info("Removing tag: {} from file: {}", tagId, id);
        tagService.removeTagFromAttachment(id, tagId);
        return ResponseEntity.ok().build();
    }
} 