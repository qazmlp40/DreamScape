package signup.dreamscape.Repository;

import org.springframework.stereotype.Repository;

import java.util.HashMap;
import java.util.Map;

@Repository
public class RefreshTokenRepository {

    private final Map<Long, String> store = new HashMap<>();

    public void save(Long userId, String refreshToken) {
        store.put(userId, refreshToken);
    }

    public String findByUserId(Long userId) {
        return store.get(userId);
    }

    public void delete(Long userId) {
        store.remove(userId);
    }
}