package dev.m4tt3o.minics.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
        HttpServletRequest request,
        HttpServletResponse response,
        FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        System.out.println(
            "[Security Debug] Request URL: " + request.getRequestURI()
        );
        System.out.println(
            "[Security Debug] Authorization header: " + authHeader
        );

        final String jwt;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        try {
            username = jwtUtil.extractUsername(jwt);
            System.out.println(
                "[Security Debug] Extracted username: " + username
            );

            if (
                username != null &&
                SecurityContextHolder.getContext().getAuthentication() == null
            ) {
                if (jwtUtil.validateToken(jwt, username)) {
                    System.out.println(
                        "[Security Debug] Token validation successful."
                    );
                    UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            new ArrayList<>()
                        );
                    authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(
                            request
                        )
                    );
                    SecurityContextHolder.getContext().setAuthentication(
                        authToken
                    );
                } else {
                    System.out.println(
                        "[Security Debug] Token validation failed."
                    );
                }
            }
        } catch (Exception e) {
            System.err.println(
                "[Security Debug] Token processing error: " + e.getMessage()
            );
            e.printStackTrace();
        }

        filterChain.doFilter(request, response);
    }
}
