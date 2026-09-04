# Rohit Yadav

Public site and admin writer for long-form study editions.

## Run locally

```bash
cp .env.example .env
docker compose up -d
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin
- Password: `ADMIN_PASSWORD` from `.env` (default `study-editions`)
