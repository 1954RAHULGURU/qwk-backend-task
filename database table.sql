CREATE TABLE User (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  gender VARCHAR(10),
  city VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL
);
