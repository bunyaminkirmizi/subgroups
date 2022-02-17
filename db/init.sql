--DROP DATABASE IF exists unihub;--DELETE DATABASE IF EXISTS

CREATE DATABASE IF NOT EXISTS unihub; --CREATE DATABASE IF NOT EXISTS

CONNECT unihub;

CREATE TABLE user(
    id INT NOT NULL auto_increment,
    username varchar(15) NOT NULL UNIQUE,
    email varchar(255) NOT NULL UNIQUE ,
    hashed_password varchar(255) NOT NULL,
    register_timestamp TIMESTAMP(2) NOT NULL DEFAULT CURRENT_TIMESTAMP(2),
    PRIMARY KEY (id)
);

CREATE TABLE groups (
    id INT NOT NULL auto_increment,
    parent_group INT NOT NULL,
    name varchar(32) NOT NULL UNIQUE,
    PRIMARY KEY (id)
);

CREATE TABLE votes (
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    vote INT -- '1' for upvote '-1' for downvote
);
-- INSERT INTO votes (user_id, post_id,vote) VALUES (1,2,'up');

CREATE TABLE sessions (
    id varchar(32) NOT NULL,
    session_reg_date DATE,
    data text,
    PRIMARY KEY (id)
);

CREATE TABLE post (
    id INT NOT NULL auto_increment,
    post_owner INT NOT NULL,
    group_owner INT NOT NULL,
    header varchar(32) NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    body text,
    create_timestamp TIMESTAMP(2) NOT NULL DEFAULT CURRENT_TIMESTAMP(2),
    PRIMARY KEY (id),
    FOREIGN KEY (post_owner) REFERENCES user (id),
    FOREIGN KEY (group_owner) REFERENCES groups (id)
);

INSERT INTO groups (parent_group,name) values(1,"main");