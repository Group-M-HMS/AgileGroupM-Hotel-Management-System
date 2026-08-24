CREATE TABLE experiences (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description TEXT,
    long_description TEXT,
    price DECIMAL(19, 2) NOT NULL,
    image_url VARCHAR(255),
    duration_hours INT,
    category VARCHAR(255) NOT NULL,
    difficulty VARCHAR(255) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL
);
