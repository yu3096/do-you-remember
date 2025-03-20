package com.doyou.remember.backend.repository;

import com.doyou.remember.backend.domain.FileInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FileInfoRepository extends JpaRepository<FileInfo, Long> {
    @Query("SELECT DISTINCT f FROM FileInfo f LEFT JOIN FETCH f.tags")
    List<FileInfo> findAllWithTags();
} 