package com.doyou.remember.backend.repository;

import com.doyou.remember.backend.domain.Attachment;
import com.doyou.remember.backend.dto.SearchCriteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    @Query("SELECT DISTINCT a FROM Attachment a " +
           "LEFT JOIN a.tags t " +
           "LEFT JOIN a.exifData e " +
           "WHERE (:#{#criteria.tags} IS NULL OR t.name IN :#{#criteria.tags}) " +
           "AND (:#{#criteria.startDate} IS NULL OR a.createdAt >= :#{#criteria.startDate}) " +
           "AND (:#{#criteria.endDate} IS NULL OR a.createdAt <= :#{#criteria.endDate}) " +
           "AND (:#{#criteria.make} IS NULL OR e.make = :#{#criteria.make}) " +
           "AND (:#{#criteria.model} IS NULL OR e.model = :#{#criteria.model}) " +
           "AND (:#{#criteria.fNumber} IS NULL OR e.fNumber = :#{#criteria.fNumber}) " +
           "AND (:#{#criteria.exposureTime} IS NULL OR e.exposureTime = :#{#criteria.exposureTime}) " +
           "AND (:#{#criteria.isoSpeedRatings} IS NULL OR e.isoSpeedRatings = :#{#criteria.isoSpeedRatings})")
    List<Attachment> findBySearchCriteria(@Param("criteria") SearchCriteria criteria);

    @Query("SELECT DISTINCT a FROM Attachment a JOIN a.tags t WHERE t.name IN :tagNames")
    List<Attachment> findByTagNames(@Param("tagNames") Set<String> tagNames);
} 