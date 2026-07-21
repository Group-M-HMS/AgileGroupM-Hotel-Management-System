CREATE TABLE pricing_rules (
    id BIGSERIAL PRIMARY KEY,
    tax_rate DECIMAL(5, 4) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE booking_quotes (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    nights INT NOT NULL,
    nightly_rate DECIMAL(12, 2) NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    tax_rate DECIMAL(5, 4) NOT NULL,
    tax DECIMAL(12, 2) NOT NULL,
    total DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert a default pricing rule (e.g. 15% tax)
INSERT INTO pricing_rules (tax_rate) VALUES (0.1500);
