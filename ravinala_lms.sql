CREATE TABLE statuses (
   id INT AUTO_INCREMENT,
   name VARCHAR(50),
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id)
);

CREATE TABLE user_types (
   id INT AUTO_INCREMENT,
   name VARCHAR(50),
   description TEXT,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id)
);

CREATE TABLE courses (
   id INT AUTO_INCREMENT,
   name VARCHAR(100) NOT NULL,
   description TEXT,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id),
   UNIQUE (name)
);

CREATE TABLE lesson_types (
   id INT AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id),
   UNIQUE (name)
);

CREATE TABLE progress_statuses (
   id INT AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id),
   UNIQUE (name)
);

CREATE TABLE users (
   id INT AUTO_INCREMENT,
   first_name VARCHAR(250) NOT NULL,
   last_name VARCHAR(250),
   email VARCHAR(200),
   email_verified_at DATETIME,
   date_of_birth DATE,
   sex VARCHAR(20),
   phone_number VARCHAR(50),
   profile_picture VARCHAR(250),
   password VARCHAR(250),
   must_change_password BOOLEAN DEFAULT TRUE,
   last_login_at DATETIME,
   remember_token VARCHAR(100),
   created_at DATETIME NOT NULL,
   updated_at DATETIME,
   user_type_id INT NOT NULL,
   status_id INT NOT NULL,
   PRIMARY KEY (id),
   FOREIGN KEY (user_type_id) REFERENCES user_types (id),
   FOREIGN KEY (status_id) REFERENCES statuses (id)
);

CREATE TABLE course_user (
   user_id INT NOT NULL,
   course_id INT NOT NULL,
   PRIMARY KEY (user_id, course_id),
   FOREIGN KEY (user_id) REFERENCES users (id),
   FOREIGN KEY (course_id) REFERENCES courses (id)
);

CREATE TABLE modules (
   id INT AUTO_INCREMENT,
   title VARCHAR(250) NOT NULL,
   description TEXT,
   position INT NOT NULL,
   course_id INT NOT NULL,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id),
   FOREIGN KEY (course_id) REFERENCES courses (id),
   UNIQUE (course_id, position)
);

CREATE TABLE lessons (
   id INT AUTO_INCREMENT,
   title VARCHAR(250) NOT NULL,
   description TEXT,
   file_path VARCHAR(500),
   duration DECIMAL(8,2),
   position INT NOT NULL,
   is_published BOOLEAN NOT NULL DEFAULT FALSE,
   lesson_type_id INT NOT NULL,
   module_id INT NOT NULL,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id),
   FOREIGN KEY (lesson_type_id) REFERENCES lesson_types (id),
   FOREIGN KEY (module_id) REFERENCES modules (id),
   UNIQUE (module_id, position)
);

CREATE TABLE permissions (
   id INT AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL,
   description TEXT,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id),
   UNIQUE (name)
);

CREATE TABLE user_permissions (
   user_id INT NOT NULL,
   permission_id INT NOT NULL,
   PRIMARY KEY (user_id, permission_id),
   FOREIGN KEY (user_id) REFERENCES users (id),
   FOREIGN KEY (permission_id) REFERENCES permissions (id)
);

CREATE TABLE course_progress (
   id INT AUTO_INCREMENT,
   user_id INT NOT NULL,
   course_id INT NOT NULL,
   progress_status_id INT NOT NULL,
   progress_percentage DECIMAL(5,2) DEFAULT 0,
   started_at DATETIME,
   completed_at DATETIME,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id),
   FOREIGN KEY (user_id) REFERENCES users (id),
   FOREIGN KEY (course_id) REFERENCES courses (id),
   FOREIGN KEY (progress_status_id) REFERENCES progress_statuses (id),
   UNIQUE (user_id, course_id)
);

CREATE TABLE module_progress (
   id INT AUTO_INCREMENT,
   course_progress_id INT NOT NULL,
   user_id INT NOT NULL,
   module_id INT NOT NULL,
   progress_status_id INT NOT NULL,
   progress_percentage DECIMAL(5,2) DEFAULT 0,
   is_active BOOLEAN DEFAULT FALSE,
   started_at DATETIME,
   completed_at DATETIME,
   created_at DATETIME,
   updated_at DATETIME,
   PRIMARY KEY (id),
   FOREIGN KEY (course_progress_id) REFERENCES course_progress (id),
   FOREIGN KEY (user_id) REFERENCES users (id),
   FOREIGN KEY (module_id) REFERENCES modules (id),
   FOREIGN KEY (progress_status_id) REFERENCES progress_statuses (id),
   UNIQUE (user_id, module_id)
);

CREATE TABLE lesson_progress (
   id INT AUTO_INCREMENT,
   module_progress_id INT NOT NULL,
   lesson_id INT NOT NULL,
   user_id INT NOT NULL,
   is_completed BOOLEAN DEFAULT FALSE,
   completed_at DATETIME,
   created_at DATETIME NOT NULL,
   updated_at DATETIME,
   PRIMARY KEY (id),
   FOREIGN KEY (module_progress_id) REFERENCES module_progress (id),
   FOREIGN KEY (lesson_id) REFERENCES lessons (id),
   FOREIGN KEY (user_id) REFERENCES users (id),
   UNIQUE (user_id, lesson_id)
);
