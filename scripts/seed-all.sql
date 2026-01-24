-- Master seed file - runs all seed scripts in correct order
-- Run with: psql $DATABASE_URL -f scripts/seed-all.sql

-- 1. Seed asset types first (no dependencies)
\echo 'Seeding asset types...'
\i scripts/seed-asset-types.sql

-- 2. Seed assets (depends on asset_types)
\echo 'Seeding assets...'
\i scripts/seed-assets.sql

-- 3. Seed timeframes (no dependencies)
\echo 'Seeding timeframes...'
\i scripts/seed-timeframes.sql

-- 4. Seed strategies (no dependencies)
\echo 'Seeding strategies...'
\i scripts/seed-strategies.sql

-- 5. Seed sample trades (no dependencies, uses raw asset symbols)
\echo 'Seeding sample trades...'
\i scripts/seed-trades.sql

\echo 'All seed data inserted successfully!'
