package signup.dreamscape.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import signup.dreamscape.Security.JwtAuthenticationFilter;
import signup.dreamscape.Security.JwtProvider;
import org.springframework.security.config.http.SessionCreationPolicy;
import signup.dreamscape.Security.OAuth2SuccessHandler; // 로컬에서 추가
import signup.dreamscape.Service.CustomOAuth2UserService; // 로컬에서 추가

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtProvider jwtProvider;
    private final CustomOAuth2UserService customOAuth2UserService; // 로컬에서 추가
    private final OAuth2SuccessHandler oAuth2SuccessHandler; // 로컬에서 추가

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtProvider);
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())   // csrf 비활성화

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-ui.html",
                                "/webjars/**",
                                "/t_user/signup",
                                "/t_user/login",
                                "/t_user/delete/all",
                                "/t_user/**",
                                "/api/media/**",
                                "/t_user/refresh"
                        ).permitAll()
                        .anyRequest().authenticated()
                )

                // oauth2Login 연결 (로컬에서 추가)
                .oauth2Login(oauth -> oauth
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2SuccessHandler)
                )

                .addFilterBefore(jwtAuthenticationFilter(),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}