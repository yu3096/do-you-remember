-- users 테이블 생성
create table if not exists users (
    id uuid default random_uuid() primary key,
    email varchar(255) unique not null,
    username varchar(50) unique,
    password varchar(255),
    profile_image_url varchar(255),
    created_at timestamp default current_timestamp not null,
    updated_at timestamp default current_timestamp not null
);

-- social_accounts 테이블 생성
create table if not exists social_accounts (
    id uuid default random_uuid() primary key,
    user_id uuid references users(id) on delete cascade,
    provider varchar(20) not null,
    provider_id varchar(255) not null,
    provider_email varchar(255),
    provider_profile_image varchar(255),
    created_at timestamp default current_timestamp not null,
    updated_at timestamp default current_timestamp not null,
    constraint uk_provider_id unique(provider, provider_id)
);

-- memories 테이블 생성
create table if not exists memories (
    id uuid default random_uuid() primary key,
    user_id uuid references users(id) not null,
    title varchar(255) not null,
    content text,
    reminder_date timestamp,
    importance int,
    status varchar(20) default 'ACTIVE',
    created_at timestamp default current_timestamp not null,
    updated_at timestamp default current_timestamp not null,
    constraint chk_importance check (importance between 1 and 5),
    constraint chk_status check (status in ('ACTIVE', 'ARCHIVED', 'DELETED'))
);

-- tags 테이블 생성
create table if not exists tags (
    id uuid default random_uuid() primary key,
    name varchar(50) not null,
    user_id uuid references users(id) not null,
    created_at timestamp default current_timestamp not null,
    constraint uk_tag_name_user unique(name, user_id)
);

-- memory_tags 테이블 생성
create table if not exists memory_tags (
    memory_id uuid references memories(id) on delete cascade,
    tag_id uuid references tags(id) on delete cascade,
    created_at timestamp default current_timestamp not null,
    primary key (memory_id, tag_id)
);

-- attachments 테이블 생성
create table if not exists attachments (
    id bigint auto_increment primary key,
    file_name varchar(255) not null,
    file_type varchar(100) not null,
    file_size bigint not null,
    storage_path varchar(255) not null,
    created_at timestamp default current_timestamp not null
); 