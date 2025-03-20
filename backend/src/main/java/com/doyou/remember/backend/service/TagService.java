package com.doyou.remember.backend.service;

import com.doyou.remember.backend.domain.FileInfo;
import com.doyou.remember.backend.domain.Tag;
import com.doyou.remember.backend.repository.FileInfoRepository;
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
    private final FileInfoRepository fileInfoRepository;

    @Transactional
    public Tag createTag(String name) {
        if (tagRepository.existsByName(name)) {
            return tagRepository.findByName(name).get();
        }
        return tagRepository.save(Tag.builder().name(name).build());
    }

    @Transactional
    public void addTagsToAttachment(Long fileId, Set<String> tagNames) {
        FileInfo fileInfo = fileInfoRepository.findById(fileId)
            .orElseThrow(() -> new IllegalArgumentException("File not found"));

        Set<Tag> newTags = tagNames.stream()
            .map(this::createTag)
            .collect(Collectors.toSet());

        newTags.forEach(fileInfo::addTag);
        fileInfoRepository.save(fileInfo);
    }

    @Transactional(readOnly = true)
    public Set<Tag> getTagsByAttachment(Long fileId) {
        return fileInfoRepository.findById(fileId)
            .map(FileInfo::getTags)
            .orElse(new HashSet<>());
    }

    @Transactional(readOnly = true)
    public List<Tag> getAllTags() {
        return tagRepository.findAll();
    }

    @Transactional
    public void removeTagFromAttachment(Long fileId, Long tagId) {
        FileInfo fileInfo = fileInfoRepository.findById(fileId)
            .orElseThrow(() -> new IllegalArgumentException("File not found"));
        Tag tag = tagRepository.findById(tagId)
            .orElseThrow(() -> new IllegalArgumentException("Tag not found"));

        fileInfo.removeTag(tag);
        fileInfoRepository.save(fileInfo);
    }
} 