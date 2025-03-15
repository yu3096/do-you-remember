package com.doyou.remember.backend.repository;

import com.doyou.remember.backend.domain.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    @Query("SELECT DISTINCT a FROM Attachment a JOIN a.tags t WHERE t.name IN :tagNames")
    List<Attachment> findByTagNames(@Param("tagNames") Set<String> tagNames);
} 