# How to apply the initial migration

## Option A — using psql (recommended)

Run the following command, replacing `<PGPASSWORD>` with your postgres superuser password:

```powershell
$env:PGPASSWORD='<PGPASSWORD>'
psql -U postgres -d booking_platform -f prisma/migrations/20260710_init/migration.sql
```

## Option B — grant booking_user DDL rights, then let Prisma run it

```powershell
# 1. Connect as a superuser and grant rights
$env:PGPASSWORD='<PGPASSWORD>'
psql -U postgres -d booking_platform -c "GRANT ALL PRIVILEGES ON SCHEMA public TO booking_user; ALTER USER booking_user CREATEDB;"

# 2. Now run migrate dev normally
npx prisma migrate dev --name init
```

## Option C — mark migration as already applied (if you ran the SQL manually)

```powershell
npx prisma migrate resolve --applied 20260710_init
```
