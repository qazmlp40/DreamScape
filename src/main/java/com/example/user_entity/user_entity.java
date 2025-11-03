package com.example.user_entity;


import jakarta.persistence.Entity;
import jakarta.persistence.Id;

import java.time.LocalDateTime;

@Entity
public class user_entity {


    @Id
    private Long userId;        // PK

    private String name;        // 사용자 이름

    private String email;       // 이메일 (중복 불가)

    private String password;    // 비밀번호

    private String profileImage;    // 프로필 이미지 URL

    private String socialProvider;  // 소셜 로그인 제공자 (e.g., google, kakao 등)

    private LocalDateTime createdAt;    // 생성일자
    private LocalDateTime updatedAt;
}
