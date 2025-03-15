package com.doyou.remember.backend.service;

import com.doyou.remember.backend.domain.Attachment;
import com.doyou.remember.backend.domain.Tag;
import com.doyou.remember.backend.repository.AttachmentRepository;
import com.doyou.remember.backend.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {
    private final TagRepository tagRepository;
    private final AttachmentRepository attachmentRepository;

    @Transactional
    public Tag createTag(String name) {
        if (tagRepository.existsByName(name)) {
            return tagRepository.findByName(name).get();
        }
        return tagRepository.save(Tag.builder().name(name).build());
    }

    @Transactional
    public void addTagsToAttachment(Long attachmentId, Set<String> tagNames) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));

        Set<Tag> newTags = tagNames.stream()
            .map(this::createTag)
            .collect(Collectors.toSet());

        newTags.forEach(attachment::addTag);
        attachmentRepository.save(attachment);
    }

    @Transactional(readOnly = true)
    public Set<Tag> getTagsByAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
            .map(Attachment::getTags)
            .orElse(new HashSet<>());
    }

    @Transactional(readOnly = true)
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Transactional
    public void removeTagFromAttachment(Long attachmentId, Long tagId) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
            .orElseThrow(() -> new IllegalArgumentException("Attachment not found"));
        Tag tag = tagRepository.findById(tagId)
            .orElseThrow(() -> new IllegalArgumentException("Tag not found"));

        attachment.removeTag(tag);
        attachmentRepository.save(attachment);
    }
} 