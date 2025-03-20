package com.doyou.remember.backend.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
public class Album {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    
    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private Integer photoCount;

    @Column(name = "cover_image_id")
    private Long coverImageId;

    @Column(name = "cover_image_position")
    private String coverImagePosition;

    @ManyToMany
    @JoinTable(
        name = "album_files",
        joinColumns = @JoinColumn(name = "album_id"),
        inverseJoinColumns = @JoinColumn(name = "file_id")
    )
    private List<FileInfo> files = new ArrayList<>();

    @Column(name = "start_date")
    private LocalDateTime startDate;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
} 