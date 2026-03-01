# Nimap Full Stack CRUD Assessment

Full-stack CRUD app using Node.js + Express, Angular, and Supabase PostgreSQL.

## Tech Stack

- Backend: Node.js, Express, pg, dotenv, cors
- Frontend: Angular (module-based), Reactive Forms, HttpClient
- Database: Supabase PostgreSQL (relational schema)

## Project Structure

```text
nimap-test/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── category.controller.js
│   │   └── product.controller.js
│   ├── routes/
│   │   ├── category.routes.js
│   │   └── product.routes.js
│   ├── app.js
│   ├── server.js
│   ├── schema.sql
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/app/
│   │   ├── core/services/
│   │   │   ├── category.service.ts
│   │   │   └── product.service.ts
│   │   ├── features/category/
│   │   │   ├── category-list.component.ts
│   │   │   └── category-form.component.ts
│   │   ├── features/product/
│   │   │   ├── product-list.component.ts
│   │   │   └── product-form.component.ts
│   │   ├── app-routing.module.ts
│   │   ├── app.module.ts
│   │   └── app.component.ts
│   └── package.json
└── README.md
```

## Supabase Database Setup

1. Open your Supabase project SQL Editor.
2. Run SQL from `backend/schema.sql`.

Schema used:

```sql
create table if not exists categories (
    category_id serial primary key,
    category_name varchar(100) not null,
    created_at timestamp default now()
);

create table if not exists products (
    product_id serial primary key,
    product_name varchar(150) not null,
    category_id int not null references categories(category_id) on delete cascade,
    created_at timestamp default now()
);

create index if not exists idx_products_category_id on products(category_id);
```

## Backend Setup

```bash
cd backend
cp .env.example .env
```

Update `.env`:

```env
PORT=5000
SUPABASE_HOST=your-supabase-host
SUPABASE_DB=postgres
SUPABASE_USER=postgres
SUPABASE_PASSWORD=your-password
SUPABASE_PORT=5432
```

Install and run:

```bash
npm install
npm run dev
```

Backend runs on: `http://localhost:5000`

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend runs on: `http://localhost:4200`

## API Endpoints

Base URL: `http://localhost:5000/api`

### Category APIs

- `POST /categories`
- `GET /categories`
- `PUT /categories/:id`
- `DELETE /categories/:id`

Sample create category:

```http
POST /api/categories
Content-Type: application/json

{
  "categoryName": "Electronics"
}
```

### Product APIs

- `POST /products`
- `GET /products/:id`
- `PUT /products/:id`
- `DELETE /products/:id`
- `GET /products?page=1&pageSize=10`

Product list uses SQL JOIN + server-side pagination.

```sql
SELECT p.product_id,
       p.product_name,
       p.category_id,
       c.category_name
FROM products p
JOIN categories c
  ON p.category_id = c.category_id
ORDER BY p.product_id
LIMIT $1
OFFSET $2;
```

Offset formula:

- `OFFSET = (pageNumber - 1) * pageSize`

Example:

- `page = 9`, `pageSize = 10` → `OFFSET 80`, `LIMIT 10`

Sample list response:

```json
{
  "data": [],
  "page": 1,
  "pageSize": 10,
  "totalRecords": 100,
  "totalPages": 10
}
```

## Validation Highlights

- Backend validates required `categoryName` and `productName`.
- Backend validates `categoryId` and verifies category exists.
- Backend validates positive integer `page` and `pageSize`.
- Frontend uses required validators and disables submit when invalid.

## Notes

- Product list supports page-size options: 5, 10, 20.
- UI includes delete confirmation.
- Product page shows total records and empty states.
