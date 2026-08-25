package com.hms.booking_service.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Component
public class FirebaseConfig {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    // Absolute path to the service-account JSON, injected at runtime (e.g. a file
    // bind-mounted into the container). The credential is never committed to the repo:
    // a public service-account key gets auto-disabled by Google's secret scanner, so it
    // must live only on the host and be provided here. Empty in local/CI builds.
    @Value("${firebase.credentials-path:}")
    private String credentialsPath;

    @PostConstruct
    public void init() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return;
            }

            InputStream serviceAccount = resolveCredentials();
            if (serviceAccount == null) {
                log.warn("No Firebase credentials found (firebase.credentials-path unset and no "
                        + "classpath secret present); skipping Firebase Admin initialization. "
                        + "ID-token verification will fail until credentials are provided.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized.");
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize Firebase Admin SDK", e);
        }
    }

    private InputStream resolveCredentials() throws IOException {
        if (credentialsPath != null && !credentialsPath.isBlank()) {
            File file = new File(credentialsPath);
            if (file.exists()) {
                return new FileInputStream(file);
            }
            log.warn("firebase.credentials-path is set to '{}' but no file exists there.", credentialsPath);
            return null;
        }

        // Local-dev fallback: a developer may drop their own key at this (gitignored) path.
        ClassPathResource classpath = new ClassPathResource("secrets/firebase-service-account.json");
        return classpath.exists() ? classpath.getInputStream() : null;
    }
}
