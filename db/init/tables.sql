CREATE TABLE IF NOT EXISTS users (
  user_id BIGSERIAL PRIMARY KEY,
  username varchar(15) UNIQUE NOT NULL ,
  email varchar(100) UNIQUE NOT NULL,
  password_hash varchar(250) NOT NULL,
  register_timestamp timestamp NOT NULL,
  email_activation_pass TEXT NOT NULL,
  profile_photo_path varchar(250),
  profile_about_text TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  message_id BIGSERIAL PRIMARY KEY,
  user_id_sender int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  user_id_receiver int NOT NULL REFERENCES users(user_id),
  header varchar(30) NOT NULL,
  cryptic_text TEXT NOT NULL,
  is_read boolean DEFAULT FALSE NOT NULL,
  send_timestamp timestamp
);

CREATE TABLE IF NOT EXISTS groups (
  group_id BIGSERIAL PRIMARY KEY,
  user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  group_name varchar(30),
  is_public boolean DEFAULT TRUE,
  group_create_timestamp timestamp,
  group_info TEXT,
  bannerfilename varchar(150)
);

CREATE TABLE IF NOT EXISTS posts (
  post_id BIGSERIAL PRIMARY KEY,
  user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  group_id int NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
  header varchar(50),
  body TEXT NOT NULL,
  send_timestamp timestamp,
  multimedia_paths varchar(255) ARRAY
);

CREATE TABLE IF NOT EXISTS notifications (
  notification_id BIGSERIAL PRIMARY KEY,
  user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  header varchar(50),
  body TEXT NOT NULL,
  send_timestamp timestamp,
  icon_path varchar(255)
);

CREATE TABLE IF NOT EXISTS user_notification_info (
  notification_id BIGSERIAL PRIMARY KEY,
  user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  auth varchar(250),
  endpointurl varchar(300)
);

CREATE TABLE IF NOT EXISTS groups_hierarchy (
  group_id int NOT NULL,
  parent_group_id int NOT NULL
);

CREATE TABLE IF NOT EXISTS permissions (
  user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  permission_code int UNIQUE NOT NULL,
  notifications boolean
);

CREATE TABLE IF NOT EXISTS vote(
  user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  post_id int NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  vote_type boolean,
  vote_timestamp timestamp
);

CREATE TABLE IF NOT EXISTS comment (
  comment_id BIGSERIAL PRIMARY KEY,
  owner_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  post_id int NOT NULL REFERENCES posts(post_id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  send_timestamp timestamp
);
  
CREATE TABLE IF NOT EXISTS group_participants (
  group_id int NOT NULL REFERENCES groups(group_id) ON DELETE CASCADE,
  user_id int NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  notifications boolean DEFAULT FALSE
);

--create admin user
INSERT INTO users(username,email,password_hash,register_timestamp,email_activation_pass)values(
  'admin',
  'admin@subgroups.com',
  '$2b$12$RkJ/71EQvgoAkLRORmp1LOw5wctuWQ.XpKlg25hid6pedTwJpXjGK',current_timestamp,FALSE)
  ON CONFLICT DO NOTHING;

--create main group
INSERT INTO groups
    (user_id,group_name)
SELECT 1,'main'
WHERE
    NOT EXISTS (
        select group_id FROM groups WHERE group_id = 1
    );