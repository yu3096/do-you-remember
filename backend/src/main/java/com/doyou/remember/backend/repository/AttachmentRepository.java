package com.doyou.remember.backend.repository;

import com.doyou.remember.backend.domain.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
} 