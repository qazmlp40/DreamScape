package signup.dreamscape.config;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DreamScape API Docs")
                        .version("1.0")
                        .description("AI 기반 꿈 해몽 및 통계 서비스 'Dreamscape'의 API 문서입니다."));
    }
}