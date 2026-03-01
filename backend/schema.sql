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
