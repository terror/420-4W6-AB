DROP DATABASE IF EXISTS `PokemonDB`;
CREATE DATABASE IF NOT EXISTS `PokemonDB`;

USE `PokemonDB`;

DROP TABLE IF EXISTS `pokemon`;
CREATE TABLE `pokemon` (
    `id` INTEGER AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `type` VARCHAR(100) NOT NULL,

    CONSTRAINT `pk_pokemon_id`
        PRIMARY KEY (`id`),
    CONSTRAINT `uq_pokemon_name`
        UNIQUE (`name`)
);
