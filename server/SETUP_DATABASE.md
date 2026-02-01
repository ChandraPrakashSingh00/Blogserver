# Database Setup Instructions

## Fix PostgreSQL Permissions Issue

The error "permission denied for schema public" occurs because your PostgreSQL user doesn't have the necessary permissions. Here's how to fix it:

### Option 1: Run as PostgreSQL superuser (Recommended)

Open a terminal and run:

```bash
sudo -u postgres psql
```

Then in the psql prompt, run:

```sql
-- Grant permissions to your database user (replace 'postgres' with your actual DB_USER if different)
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- If you're using a different database user, also run:
-- GRANT ALL ON SCHEMA public TO your_username;

-- Exit psql
\q
```

### Option 2: Connect directly to your database

```bash
psql -U postgres -d medium_db
```

Then run:

```sql
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;
\q
```

### Option 3: If you're using a different database user

If your `.env` file has a different `DB_USER`, replace `postgres` with that username in the GRANT commands above.

### Verify the fix

After running the GRANT commands, try starting your backend server again:

```bash
cd backend
npm run dev
```

The database tables should now be created successfully.

## Alternative: Create database with proper permissions

If the above doesn't work, you can recreate the database with proper permissions:

```bash
# Drop and recreate the database
sudo -u postgres psql -c "DROP DATABASE IF EXISTS medium_db;"
sudo -u postgres psql -c "CREATE DATABASE medium_db OWNER postgres;"
sudo -u postgres psql -d medium_db -c "GRANT ALL ON SCHEMA public TO postgres;"
```

