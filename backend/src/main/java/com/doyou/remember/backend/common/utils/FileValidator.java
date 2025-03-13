package com.doyou.remember.backend.common.utils;

import com.doyou.remember.backend.common.enums.AllowedFileExtension;
import org.apache.tika.Tika;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;

public class FileValidator {
    private static final Tika tika = new Tika();
    
    public static void validateFile(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null || fileName.contains("..")) {
            throw new IllegalArgumentException("잘못된 파일 이름입니다.");
        }

        String fileExtension = getFileExtension(fileName);
        if (!AllowedFileExtension.contains(fileExtension.substring(1))) {
            throw new IllegalArgumentException("허용되지 않는 파일 확장자입니다.");
        }

        // MIME 타입 검사
        String mimeType = tika.detect(file.getInputStream());
        if (!mimeType.startsWith("image/")) {
            throw new IllegalArgumentException("이미지 파일만 업로드할 수 있습니다.");
        }

        // 실행 가능한 콘텐츠 검사
        byte[] header = new byte[4];
        file.getInputStream().read(header);
        if (Arrays.equals(header, new byte[]{0x4D, 0x5A})) { // MZ header (실행 파일)
            throw new IllegalArgumentException("실행 파일은 업로드할 수 없습니다.");
        }
    }

    private static String getFileExtension(String fileName) {
        try {
            return fileName.substring(fileName.lastIndexOf(".")).toLowerCase();
        } catch (StringIndexOutOfBoundsException e) {
            throw new IllegalArgumentException("잘못된 형식의 파일입니다.");
        }
    }
} 
