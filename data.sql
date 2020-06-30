CREATE TABLE companies(
    handle TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    num_employees INTEGER,
    description TEXT,
    logo_url TEXT
);

CREATE TABLE users(
    username TEXT PRIMARY KEY,
    password TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    photo_url TEXT,
    is_admin BOOLEAN NOT NULL default FALSE
);

CREATE TABLE jobs(
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    salary FLOAT,
    equity FLOAT CHECK(equity <= 1.0),
    company_handle TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
    date_posted TIMESTAMP DEFAULT current_timestamp
);

-- INSERT INTO users (username, password, is_admin)
-- VALUES ('test', '$2b$04$mAQoxN1bmAWpPZnYq3EA/Of3wLlHEz5Sb8wK/GTCzeWtWbEIVOMby', 'true');

-- INSERT INTO companies(handle, name, num_employees) VALUES
--     ('apple', 'apple inc', 1000),
--     ('nike', 'nike inc', 200),
--     ('rithm', 'rithm school', 10),
--     ('starbucks', 'starbucks inc', 500);

--   INSERT INTO jobs(title, salary, company_handle) VALUES
--     ('engineer', 100000, 'apple'),
--     ('plumber', 120000, 'apple'),
--     ('barista', 200000, 'nike');