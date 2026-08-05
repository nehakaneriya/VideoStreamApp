package com.neha.VideoStreamApp.helper;

import org.springframework.data.domain.KeysetScrollPosition;
import org.springframework.data.domain.ScrollPosition;

import java.time.Instant;
import java.util.Base64;
import java.util.Map;

public class ScrollPositionCodec {

    // Encode ScrollPosition to Base64 string
    public static String encode(ScrollPosition position) {
        if (position == null || position.isInitial()) {
            return null;
        }

        if (position instanceof KeysetScrollPosition keysetPosition) {
            Map<String, Object> keys = keysetPosition.getKeys();

            // Create a simple string representation: key1=value1,key2=value2
            StringBuilder sb = new StringBuilder();
            keys.forEach((key, value) -> {
                if (sb.length() > 0) sb.append(",");
                sb.append(key).append("=").append(value);
            });

            return Base64.getEncoder().encodeToString(sb.toString().getBytes());
        }

        return null;
    }

    // Decode Base64 string to ScrollPosition
    public static ScrollPosition decode(String encodedPosition) {
        if (encodedPosition == null || encodedPosition.isBlank()) {
            return ScrollPosition.keyset();
        }

        try {
            String decoded = new String(Base64.getDecoder().decode(encodedPosition));
            String[] pairs = decoded.split(",");

            Map<String, Object> keys = new java.util.HashMap<>();
            for (String pair : pairs) {
                String[] keyValue = pair.split("=");
                if (keyValue.length == 2) {
                    String key = keyValue[0];
                    String value = keyValue[1];

                    // Try to parse as Long first, then as String
                    try {
                        keys.put(key, Instant.parse(value));
                        continue;
                    } catch (Exception ignored) {}
                    // 2. Try parsing as Long
                    try {
                        keys.put(key, Long.parseLong(value));
                        continue;
                    } catch (NumberFormatException ignored) {}

                    // 3. Fallback to String (for videoId, title, contentType, etc.)
                    keys.put(key, value);
                }
            }

            return ScrollPosition.forward(keys);
        } catch (Exception e) {
            return ScrollPosition.keyset();
        }
    }
}

