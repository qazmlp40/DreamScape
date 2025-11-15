package signup.dreamscape.Security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtProvider {

    // HS256 비밀키 (실제 환경에선 외부 설정 파일에서 관리 권장)
    private final Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);

    private final long validityInMillis = 3600000; // 1시간

    // 이메일(사용자 식별자)을 토큰으로 생성
    public String createToken(String email) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + validityInMillis);

        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(key)
                .compact();
    }

}