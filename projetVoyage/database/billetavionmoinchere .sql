-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  ven. 29 mai 2026 à 19:17
-- Version du serveur :  5.7.23
-- Version de PHP :  7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données :  `billetavionmoinchere`
--

-- --------------------------------------------------------

--
-- Structure de la table `alerte`
--

DROP TABLE IF EXISTS `alerte`;
CREATE TABLE IF NOT EXISTS `alerte` (
  `alerte_id` int(11) NOT NULL,
  `prixCible` decimal(10,2) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `dateCreation` date DEFAULT NULL,
  `vol_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`alerte_id`),
  KEY `vol_id` (`vol_id`),
  KEY `fk_user` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `alerte`
--

INSERT INTO `alerte` (`alerte_id`, `prixCible`, `route`, `active`, `dateCreation`, `vol_id`, `user_id`) VALUES
(1, '400.00', 'CDG-JFK', 1, '2026-05-05', 101, 1),
(2, '350.00', 'CDG-JFK', 1, '2026-05-05', 101, 1),
(3, '100.00', 'FRA-CDG', 1, '2026-05-05', 102, 1);

-- --------------------------------------------------------

--
-- Structure de la table `compagnie`
--

DROP TABLE IF EXISTS `compagnie`;
CREATE TABLE IF NOT EXISTS `compagnie` (
  `compagnie_id` int(11) NOT NULL,
  `code_IATA` varchar(3) DEFAULT NULL,
  `nom_compagnie` varchar(100) DEFAULT NULL,
  `pays` varchar(50) DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`compagnie_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `compagnie`
--

INSERT INTO `compagnie` (`compagnie_id`, `code_IATA`, `nom_compagnie`, `pays`, `logo`) VALUES
(1, 'AF', 'Air France', 'France', 'logo_af.png'),
(2, 'LH', 'Lufthansa', 'Allemagne', 'logo_lh.png');

-- --------------------------------------------------------

--
-- Structure de la table `recherche`
--

DROP TABLE IF EXISTS `recherche`;
CREATE TABLE IF NOT EXISTS `recherche` (
  `recherche_id` int(11) NOT NULL,
  `villeDepart` varchar(100) DEFAULT NULL,
  `villeArrivee` varchar(100) DEFAULT NULL,
  `dateAller` date DEFAULT NULL,
  `dateRetour` date DEFAULT NULL,
  `nbPassagers` int(11) DEFAULT NULL,
  `classe` varchar(50) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `vol_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`recherche_id`),
  KEY `user_id` (`user_id`),
  KEY `vol_id` (`vol_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `recherche`
--

INSERT INTO `recherche` (`recherche_id`, `villeDepart`, `villeArrivee`, `dateAller`, `dateRetour`, `nbPassagers`, `classe`, `user_id`, `vol_id`) VALUES
(1, 'Paris', 'New York', '2023-12-01', NULL, 1, 'Économique', 1, 101),
(2, 'Francfort', 'Paris', '2023-12-01', NULL, 2, 'Business', 2, 102);

-- --------------------------------------------------------

--
-- Structure de la table `tarif`
--

DROP TABLE IF EXISTS `tarif`;
CREATE TABLE IF NOT EXISTS `tarif` (
  `tarif_id` int(11) NOT NULL,
  `prix` decimal(10,2) DEFAULT NULL,
  `devise` varchar(3) DEFAULT NULL,
  `taxesIncluses` tinyint(1) DEFAULT NULL,
  `bagagesInclus` tinyint(1) DEFAULT NULL,
  `vol_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`tarif_id`),
  KEY `vol_id` (`vol_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `tarif`
--

INSERT INTO `tarif` (`tarif_id`, `prix`, `devise`, `taxesIncluses`, `bagagesInclus`, `vol_id`) VALUES
(1, '450.00', 'EUR', 1, 1, 101),
(2, '120.50', 'EUR', 1, 0, 102);

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `role` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'user',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`) VALUES
(11, 'Jean miguel', 'jean.miguel@example.com', '$2b$10$BzYOP43alO8x6gBQqoPuUu58LWaSlRNUiv8cc7xazBBmbJlP3Jcmm', 'user', '2026-05-20 00:01:19'),
(12, 'Miguel Kamdem', 'miguelkamdem92@gmail.com', '$2b$10$9Sn25BmIMepWl/3gDfYEmONMybRgSff4f4eHp27u98EyETZVTgA5W', 'admin', '2026-05-20 00:02:13'),
(13, 'test2', 'test01@gmail.com', '$2b$10$BL1s3zg3Gvi1Hbl9pC1LjOXQRiwTZdz8wqOGOxdFiqxtHIlUJt4Iq', 'user', '2026-05-20 01:19:21'),
(14, 'mariane fernanda', 'marianne09@gmail.com', '$2b$10$FfRU0H0k.YXcvGSjnDHb0OefsxlsVICOhcYAOvSv/GO2OSFeTK3Wu', 'user', '2026-05-21 21:48:56'),
(15, 'MBERE TEMWA JOSUE', 'josuemberetemwa@gmail.com', 'OAUTH_GOOGLE', 'user', '2026-05-24 00:06:03'),
(16, 'test1', 'test1@gmail.com', '$2b$10$NIfxJkpo4/AHRwcCdkdp3eLraGDYzGO04X24SAxz7Cwzaf6HAl/Ju', 'user', '2026-05-24 23:11:16'),
(17, 'test', 'test@gmail.com', '$2b$10$dDUnen/7gW79wujWduMRQefIoawiqQu5cgeWmOj0mUesMCazeYhHW', 'user', '2026-05-24 23:28:58'),
(18, 'test', 'test0@gmail.com', '$2b$10$uF3GSkFvJ0h2Trqjw0USEOhb5lNggo4Hs7Q8i8NcjCrW3UeUyeWVm', 'user', '2026-05-24 23:30:11');

-- --------------------------------------------------------

--
-- Structure de la table `vol`
--

DROP TABLE IF EXISTS `vol`;
CREATE TABLE IF NOT EXISTS `vol` (
  `vol_id` int(11) NOT NULL,
  `compagnie_id` int(11) DEFAULT NULL,
  `depart` varchar(3) DEFAULT NULL,
  `arrivee` varchar(3) DEFAULT NULL,
  `heureDepart` datetime DEFAULT NULL,
  `heureArrivee` datetime DEFAULT NULL,
  `nbEscales` int(11) DEFAULT NULL,
  `source` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`vol_id`),
  KEY `compagnie_id` (`compagnie_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `vol`
--

INSERT INTO `vol` (`vol_id`, `compagnie_id`, `depart`, `arrivee`, `heureDepart`, `heureArrivee`, `nbEscales`, `source`) VALUES
(101, 1, 'CDG', 'JFK', '2023-12-01 10:00:00', '2023-12-01 13:00:00', 0, 'Site Officiel'),
(102, 2, 'FRA', 'CDG', '2023-12-01 08:00:00', '2023-12-01 09:30:00', 0, 'Skyscanner');
COMMIT;


/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
