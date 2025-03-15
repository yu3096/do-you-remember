package com.doyou.remember.backend.controller;

import com.doyou.remember.backend.domain.Tag;
import com.doyou.remember.backend.service.TagService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
@Slf4j
public class TagController {
    private final TagService tagService;

    @GetMapping
    public ResponseEntity<List<Tag>> getAllTags() {
        log.info("Getting all tags");
        return ResponseEntity.ok(tagService.getAllTags());
    }

    @GetMapping("/{attachmentId}")
    public ResponseEntity<Set<Tag>> getTagsByAttachment(@PathVariable Long attachmentId) {
        log.info("Getting tags for attachment: {}", attachmentId);
        return ResponseEntity.ok(tagService.getTagsByAttachment(attachmentId));
    }

    @PostMapping("/{attachmentId}")
    public ResponseEntity<Void> addTagsToAttachment(
            @PathVariable Long attachmentId,
            @RequestBody Set<String> tagNames) {
        log.info("Adding tags: {} to attachment: {}", tagNames, attachmentId);
        tagService.addTagsToAttachment(attachmentId, tagNames);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{attachmentId}/{tagId}")
    public ResponseEntity<Void> removeTagFromAttachment(
            @PathVariable Long attachmentId,
            @PathVariable Long tagId) {
        log.info("Removing tag: {} from attachment: {}", tagId, attachmentId);
        tagService.removeTagFromAttachment(attachmentId, tagId);
        return ResponseEntity.ok().build();
    }
} 