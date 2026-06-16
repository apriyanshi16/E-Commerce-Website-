-- FashionHub Seed Data
USE fashionhub;

-- Insert Categories
INSERT INTO categories (id, name, slug, description, image_url) VALUES
('cat-1', 'Men', 'men', 'Men fashion collection', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600'),
('cat-2', 'Women', 'women', 'Women fashion collection', 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600'),
('cat-3', 'Shoes', 'shoes', 'Footwear for all occasions', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'),
('cat-4', 'Accessories', 'accessories', 'Fashion accessories', 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600'),
('cat-5', 'Bags', 'bags', 'Bags and backpacks', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600');

-- Insert Products
INSERT INTO products (id, name, slug, description, price, compare_at_price, quantity, category_id, images, is_featured, rating, reviews_count) VALUES
('prod-1', 'Classic Cotton T-Shirt', 'classic-cotton-t-shirt', 'Premium 100% cotton t-shirt with a comfortable fit.', 29.99, 39.99, 150, 'cat-1', '["https://images.unsplash.com/photo-1521572163474-6d898e6c2f0a?w=800"]', TRUE, 4.5, 128),
('prod-2', 'Slim Fit Denim Jeans', 'slim-fit-denim-jeans', 'Modern slim fit jeans crafted from premium stretch denim.', 79.99, 99.99, 85, 'cat-1', '["https://images.unsplash.com/photo-1542272604-9b0cbab39a5a?w=800"]', TRUE, 4.7, 95),
('prod-3', 'Floral Summer Dress', 'floral-summer-dress', 'Elegant floral print dress perfect for summer days.', 59.99, NULL, 75, 'cat-2', '["https://images.unsplash.com/photo-1572804013309-59a88b14a9f2?w=800"]', TRUE, 4.8, 203),
('prod-4', 'Running Sneakers', 'running-sneakers', 'Lightweight running sneakers with responsive cushioning.', 119.99, 149.99, 200, 'cat-3', '["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"]', TRUE, 4.9, 342),
('prod-5', 'Leather Handbag', 'leather-handbag', 'Premium leather handbag with multiple compartments.', 189.99, 249.99, 60, 'cat-5', '["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"]', FALSE, 4.4, 89),
('prod-6', 'Classic Watch', 'classic-watch', 'Timeless analog watch with genuine leather strap.', 89.99, 120.00, 90, 'cat-4', '["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800"]', FALSE, 4.3, 156),
('prod-7', 'Cashmere Sweater', 'cashmere-sweater', 'Luxuriously soft 100% cashmere sweater.', 159.99, 199.99, 55, 'cat-2', '["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800"]', TRUE, 4.8, 234),
('prod-8', 'Canvas Backpack', 'canvas-backpack', 'Durable canvas backpack with padded laptop compartment.', 69.99, NULL, 100, 'cat-5', '["https://images.unsplash.com/photo-1553062407-3eeb03b5c97d?w=800"]', FALSE, 4.6, 112);

-- Insert sample users (password: 'password123')
INSERT INTO users (id, email, password_hash, full_name, role) VALUES
('user-admin', 'admin@fashionhub.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtQvHnLxkXdSG', 'Admin User', 'admin'),
('user-1', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtQvHnLxkXdSG', 'John Doe', 'customer'),
('user-2', 'jane@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.VTtQvHnLxkXdSG', 'Jane Smith', 'customer');

-- Insert sample orders
INSERT INTO orders (id, order_number, user_id, status, subtotal, total, shipping_address, payment_status) VALUES
('order-1', 'ORD-2024-001', 'user-1', 'delivered', 89.98, 97.18, '{"firstName": "John", "lastName": "Doe", "address": "123 Main St", "city": "New York", "state": "NY", "zipCode": "10001"}', 'paid'),
('order-2', 'ORD-2024-002', 'user-2', 'shipped', 189.99, 199.99, '{"firstName": "Jane", "lastName": "Smith", "address": "456 Oak Ave", "city": "Los Angeles", "state": "CA", "zipCode": "90001"}', 'paid');

-- Insert order items
INSERT INTO order_items (order_id, product_id, product_name, quantity, price, total) VALUES
('order-1', 'prod-1', 'Classic Cotton T-Shirt', 2, 29.99, 59.98),
('order-1', 'prod-4', 'Running Sneakers', 1, 119.99, 119.99),
('order-2', 'prod-5', 'Leather Handbag', 1, 189.99, 189.99);

-- Insert sample reviews
INSERT INTO reviews (id, product_id, user_id, rating, title, comment, is_verified_purchase) VALUES
('rev-1', 'prod-1', 'user-1', 5, 'Great quality!', 'This t-shirt is incredibly soft and fits perfectly.', TRUE),
('rev-2', 'prod-4', 'user-1', 5, 'Best running shoes!', 'These sneakers are so comfortable.', TRUE);
