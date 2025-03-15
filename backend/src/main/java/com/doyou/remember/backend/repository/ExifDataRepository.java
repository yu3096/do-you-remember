package com.doyou.remember.backend.repository;

import com.doyou.remember.backend.domain.ExifData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExifDataRepository extends JpaRepository<ExifData, Long> {
} 