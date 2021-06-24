DROP DATABASE IF EXISTS `RedditDB`;
CREATE DATABASE IF NOT EXISTS `RedditDB`;

USE `RedditDB`;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
    `id` INTEGER AUTO_INCREMENT,
    `username` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `password` VARCHAR(100) NOT NULL,
    `avatar` VARCHAR(1000),
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `edited_at` DATETIME,
    `deleted_at` DATETIME,

    CONSTRAINT `pk_user_id`
        PRIMARY KEY (`id`),
    CONSTRAINT `uq_user_email`
        UNIQUE (`email`),
    CONSTRAINT `uq_user_username`
        UNIQUE (`username`)
);

DROP TABLE IF EXISTS `category`;
CREATE TABLE `category` (
    `id` INTEGER AUTO_INCREMENT,
    `user_id` INTEGER,
    `title` VARCHAR(100) NOT NULL,
    `description` TEXT,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `edited_at` DATETIME,
    `deleted_at` DATETIME,

    CONSTRAINT `pk_user_id`
        PRIMARY KEY (`id`),
    CONSTRAINT `fk_category_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`),
    CONSTRAINT `uq_category_title`
        UNIQUE (`title`)
);

DROP TABLE IF EXISTS `subscription`;
CREATE TABLE `subscription` (
    `category_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    CONSTRAINT `pk_subscription_category_id_user_id`
        PRIMARY KEY (`category_id`, `user_id`),
    CONSTRAINT `fk_subscription_category`
        FOREIGN KEY (`category_id`)
        REFERENCES `category`(`id`),
    CONSTRAINT `fk_subscription_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`)
);

DROP TABLE IF EXISTS `category_moderator`;
CREATE TABLE `category_moderator` (
    `category_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    CONSTRAINT `pk_category_moderator_category_id_user_id`
        PRIMARY KEY (`category_id`, `user_id`),
    CONSTRAINT `fk_category_moderator_category`
        FOREIGN KEY (`category_id`)
        REFERENCES `category`(`id`),
    CONSTRAINT `fk_category_moderator_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`)
);

DROP TABLE IF EXISTS `post`;
CREATE TABLE `post` (
    `id` INTEGER AUTO_INCREMENT,
    `user_id` INTEGER,
    `category_id` INTEGER NOT NULL,
    `title` VARCHAR(100) NOT NULL,
    `type` ENUM('URL', 'Text') NOT NULL,
    `content` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `edited_at` DATETIME,
    `deleted_at` DATETIME,

    CONSTRAINT `pk_post_id`
        PRIMARY KEY (`id`),
    CONSTRAINT `fk_post_category`
        FOREIGN KEY (`category_id`)
        REFERENCES `category`(`id`),
    CONSTRAINT `fk_post_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`)
);

DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment` (
    `id` INTEGER AUTO_INCREMENT,
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER,
    `reply_id` INTEGER,
    `content` TEXT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT NOW(),
    `edited_at` DATETIME,
    `deleted_at` DATETIME,

    CONSTRAINT `pk_comment_id`
        PRIMARY KEY (`id`),
    CONSTRAINT `fk_comment_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`),
    CONSTRAINT `fk_comment_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `post`(`id`),
    CONSTRAINT `fk_comment_reply`
        FOREIGN KEY (`reply_id`)
        REFERENCES `comment`(`id`)
);

DROP TABLE IF EXISTS `bookmarked_post`;
CREATE TABLE `bookmarked_post` (
    `post_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    CONSTRAINT `pk_bookmarked_post_post_id_user_id`
        PRIMARY KEY (`post_id`, `user_id`),
    CONSTRAINT `fk_bookmarked_post_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `post`(`id`),
    CONSTRAINT `fk_bookmarked_post_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`)
);

DROP TABLE IF EXISTS `bookmarked_comment`;
CREATE TABLE `bookmarked_comment` (
    `comment_id` INTEGER NOT NULL,
    `user_id` INTEGER NOT NULL,

    CONSTRAINT `pk_bookmarked_comment_comment_id_user_id`
        PRIMARY KEY (`comment_id`, `user_id`),
    CONSTRAINT `fk_bookmarked_comment_comment`
        FOREIGN KEY (`comment_id`)
        REFERENCES `comment`(`id`),
    CONSTRAINT `fk_bookmarked_comment_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`)
);

DROP TABLE IF EXISTS `post_vote`;
CREATE TABLE `post_vote` (
    `user_id` INTEGER NOT NULL,
    `post_id` INTEGER NOT NULL,
    `type` ENUM('Up', 'Down') NOT NULL,

    CONSTRAINT `pk_post_vote_user_id_post_id`
        PRIMARY KEY (`user_id`, `post_id`),
    CONSTRAINT `fk_post_vote_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`),
    CONSTRAINT `fk_post_vote_post`
        FOREIGN KEY (`post_id`)
        REFERENCES `post`(`id`)
);

DROP TABLE IF EXISTS `comment_vote`;
CREATE TABLE `comment_vote` (
    `user_id` INTEGER NOT NULL,
    `comment_id` INTEGER NOT NULL,
    `type` ENUM('Up', 'Down') NOT NULL,

    CONSTRAINT `pk_comment_vote_user_id_comment_id`
        PRIMARY KEY (`user_id`, `comment_id`),
    CONSTRAINT `fk_comment_vote_user`
        FOREIGN KEY (`user_id`)
        REFERENCES `user`(`id`),
    CONSTRAINT `fk_comment_vote_comment`
        FOREIGN KEY (`comment_id`)
        REFERENCES `comment`(`id`)
);
