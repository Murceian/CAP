-- ============================================================
-- CAP seed � run this in MySQL Workbench against cap_dev
-- ============================================================
CREATE DATABASE IF NOT EXISTS cap_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cap_dev;

-- -- Tables ------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'moderator', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    price DECIMAL(10, 2) NOT NULL,
    price_label VARCHAR(50),
    meta JSON,
    tags JSON,
    accent VARCHAR(20),
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    price_label VARCHAR(50),
    tiers JSON,
    meta JSON,
    tags JSON,
    accent VARCHAR(20),
    image_url TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS portfolio_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    meta JSON,
    tags JSON,
    accent VARCHAR(20),
    media_urls JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'paid',
            'shipped',
            'fulfilled',
            'cancelled'
        )
    ),
    stripe_id VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    qty INT NOT NULL DEFAULT 1,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    service_id INT,
    tier VARCHAR(20),
    booked_at DATETIME,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'completed', 'cancelled')
    ),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (service_id) REFERENCES services(id)
);

CREATE TABLE IF NOT EXISTS conversations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    subject VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversation_id INT,
    sender_id INT,
    body TEXT NOT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_type VARCHAR(50) NOT NULL,
    payload JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- -- Seed products -----------------------------------------
SET
    FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE order_items;

TRUNCATE TABLE orders;

TRUNCATE TABLE products;

SET
    FOREIGN_KEY_CHECKS = 1;

INSERT INTO
    products (
        title,
        subtitle,
        price,
        price_label,
        meta,
        tags,
        accent
    )
VALUES
    (
        'Studio Beats Pack',
        '20 royalty-free loops',
        18.00,
        '$18',
        '["Instant download","WAV"]',
        '["audio","digital"]',
        'peach'
    ),
    (
        'Print Set: City Grid',
        '3 premium matte posters',
        32.00,
        '$32',
        '["Ships in 48 hours","Limited"]',
        '["print","physical"]',
        'mint'
    ),
    (
        'Workspace Icons',
        '120 SVG icons',
        14.00,
        '$14',
        '["Editable","Figma"]',
        '["design","digital"]',
        'sky'
    ),
    (
        'Desk Kit',
        'Notebook + pen + cards',
        26.00,
        '$26',
        '["Ships in 3 days","Bundle"]',
        '["stationery","physical"]',
        'lavender'
    );

-- -- Seed services -----------------------------------------
SET
    FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE bookings;

TRUNCATE TABLE services;

SET
    FOREIGN_KEY_CHECKS = 1;

INSERT INTO
    services (
        title,
        subtitle,
        price_label,
        meta,
        tags,
        accent,
        tiers
    )
VALUES
    (
        'Brand Starter',
        'Logo + palette + type',
        'From $220',
        '["2 rounds","1 week"]',
        '["design"]',
        'amber',
        '{"basic":{"name":"Basic","price":"$220","features":["Logo (1 concept)","Color palette","2 revision rounds"]},"standard":{"name":"Standard","price":"$380","features":["Logo (2 concepts)","Palette + type system","Brand guidelines PDF","3 revision rounds"]},"premium":{"name":"Premium","price":"$620","features":["Logo (3 concepts)","Full brand system","Business card design","Social kit","Unlimited revisions"]}}'
    ),
    (
        'Product Photos',
        'Lifestyle + clean pack',
        'From $180',
        '["Studio","15 edits"]',
        '["photo"]',
        'sky',
        '{"basic":{"name":"Basic","price":"$180","features":["10 final images","1 scene setup","Standard retouching"]},"standard":{"name":"Standard","price":"$320","features":["25 final images","2 scene setups","Lifestyle + clean white","Advanced retouching"]},"premium":{"name":"Premium","price":"$520","features":["50 final images","4 scene setups","Lifestyle + detail + white","Video clip (15 sec)","Same-day turnaround"]}}'
    ),
    (
        'Landing Page',
        'One-page site',
        'From $320',
        '["Responsive","2 weeks"]',
        '["web"]',
        'peach',
        '{"basic":{"name":"Basic","price":"$320","features":["Single page","Mobile responsive","Contact form","1 revision round"]},"standard":{"name":"Standard","price":"$540","features":["Up to 3 sections","Mobile responsive","Contact form + CTA","Basic SEO setup","2 revision rounds"]},"premium":{"name":"Premium","price":"$860","features":["Full landing page","Animation + interactions","Analytics integration","Performance optimized","Unlimited revisions"]}}'
    );

-- -- Seed portfolio ----------------------------------------
TRUNCATE TABLE portfolio_items;

INSERT INTO
    portfolio_items (title, subtitle, meta, tags, accent)
VALUES
    (
        'Studio North',
        'Brand system + packaging',
        '["Identity","Print"]',
        '["brand"]',
        'mint'
    ),
    (
        'Arcade Nights',
        'Event microsite',
        '["Web","Motion"]',
        '["web"]',
        'lavender'
    ),
    (
        'Signal Coffee',
        'Photo + social kit',
        '["Photo","Social"]',
        '["photo"]',
        'amber'
    );