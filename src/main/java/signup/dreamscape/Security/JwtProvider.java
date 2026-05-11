package signup.dreamscape.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {

    private final String SECRET = "my-super-secret-key-my-super-secret-key";
    private final Key key = Keys.hmacShaKeyFor(SECRET.getBytes());

    private final long accessTokenValidTime = 1000 * 60 * 60; // 1시간
    private final long refreshTokenValidTime = 1000 * 60 * 60 * 24 * 7; // 7일

    // ✅ Access Token
    public String createAccessToken(Long userId, String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenValidTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ Refresh Token
    public String createRefreshToken(Long userId, String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenValidTime))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ 토큰에서 이메일 추출
    public String getEmail(String token) {
        return getClaims(token).getSubject();
    }

    // ✅ userId 추출
    public Long getUserId(String token) {
        return getClaims(token).get("userId", Long.class);
    }

    // ✅ 토큰 검증
    public boolean validateToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("토큰 만료");
        } catch (JwtException e) {
            System.out.println("잘못된 토큰");
        } catch (Exception e) {
            System.out.println("토큰 오류");
        }
        return false;
    }

    // ✅ Bearer 제거
    public String resolveToken(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    // 내부 파싱
    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}