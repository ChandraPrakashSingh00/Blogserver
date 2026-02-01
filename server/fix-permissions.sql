-- Fix PostgreSQL permissions for the database user
-- Run this as the postgres superuser

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- If using a different user, replace 'postgres' with your database user
-- Example: GRANT ALL ON SCHEMA public TO your_username;

