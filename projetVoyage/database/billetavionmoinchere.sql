-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  mer. 22 juil. 2026 à 11:23
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
  `alerte_id` int(11) NOT NULL AUTO_INCREMENT,
  `prixCible` decimal(10,2) DEFAULT NULL,
  `route` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `dateCreation` date DEFAULT NULL,
  `vol_id` varchar(255) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`alerte_id`),
  KEY `vol_id` (`vol_id`),
  KEY `fk_user` (`user_id`)
) ENGINE=MyISAM AUTO_INCREMENT=38 DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `alerte`
--

INSERT INTO `alerte` (`alerte_id`, `prixCible`, `route`, `active`, `dateCreation`, `vol_id`, `user_id`) VALUES
(1, '25.00', 'Départ - Arrivée', 1, '2026-06-19', 'FRA-AMS-2026-06-20-0', 22),
(2, '25.00', 'Départ - Arrivée', 1, '2026-06-19', 'NRT-SYD-2026-06-28-0', 22),
(3, '75.00', 'Départ - Arrivée', 1, '2026-06-20', 'DXB-FCO-2026-06-20-0', 23),
(4, '100.00', 'Départ - Arrivée', 1, '2026-06-21', 'NSI-DLA-2026-06-21-0', 22),
(5, '125.00', 'Départ - Arrivée', 1, '2026-06-21', 'NSI-DLA-2026-06-21-0', 22),
(6, '125.00', 'Départ - Arrivée', 1, '2026-06-21', 'FRA-FCO-2026-06-21-0', 22),
(7, '125.00', 'Départ - Arrivée', 1, '2026-06-21', 'DXB-JNB-2026-06-21-0', 22),
(8, '150.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-PNR-2026-06-21-0', 22),
(9, '175.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-PNR-2026-06-21-0', 22),
(10, '225.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-PNR-2026-06-21-0', 22),
(11, '225.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-PNR-2026-06-21-0', 22),
(12, '275.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-PNR-2026-06-21-0', 22),
(13, '250.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-PNR-2026-06-21-0', 22),
(14, '250.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-PNR-2026-06-21-0', 22),
(15, '250.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-PNR-2026-06-21-0', 22),
(16, '275.00', 'Départ - Arrivée', 1, '2026-06-21', 'DLA-NSI-2026-06-21-0', 22),
(17, '275.00', 'Départ - Arrivée', 1, '2026-06-21', 'ABJ-ALG-2026-06-21-0', 22),
(18, '300.00', 'Départ - Arrivée', 1, '2026-06-21', 'ABJ-ALG-2026-06-21-0', 22),
(19, '300.00', 'Départ - Arrivée', 1, '2026-06-21', 'ABJ-ALG-2026-06-21-0', 22),
(20, '300.00', 'Départ - Arrivée', 1, '2026-06-21', 'ABJ-ALG-2026-06-21-0', 22),
(21, '325.00', 'Départ - Arrivée', 1, '2026-06-21', 'DXB-DLA-2026-06-21-0', 22),
(22, '325.00', 'Départ - Arrivée', 1, '2026-06-21', 'EBB-BKO-2026-06-21-0', 22),
(23, '325.00', 'Départ - Arrivée', 1, '2026-06-23', 'DSS-DLA-2026-06-23-0', 22),
(24, '350.00', 'Départ - Arrivée', 1, '2026-06-23', 'DSS-DLA-2026-06-23-0', 22),
(25, '350.00', 'Départ - Arrivée', 1, '2026-06-23', 'DSS-DLA-2026-06-23-0', 22),
(26, '350.00', 'Départ - Arrivée', 1, '2026-06-23', 'BCN-RAK-2026-06-23-6', 22),
(27, '350.00', 'Départ - Arrivée', 1, '2026-06-23', 'BCN-RAK-2026-06-23-1', 22),
(28, '350.00', 'Départ - Arrivée', 1, '2026-06-23', 'BCN-RAK-2026-06-23-1', 22),
(29, '350.00', 'Départ - Arrivée', 1, '2026-06-23', 'NSI-DLA-2026-06-25-8', 23),
(30, '375.00', 'Départ - Arrivée', 1, '2026-06-23', 'NSI-DLA-2026-06-27-1', 23),
(31, '375.00', 'Départ - Arrivée', 1, '2026-06-23', 'NSI-DLA-2026-06-27-8', 23),
(32, '400.00', 'Départ - Arrivée', 1, '2026-06-23', 'CDG-FCO-2026-06-25-5', 23),
(33, '400.00', 'Départ - Arrivée', 1, '2026-06-23', 'CDG-FCO-2026-06-25-2', 23),
(34, '400.00', 'Départ - Arrivée', 1, '2026-06-24', 'CDG-FCO-2026-06-30-1', 22),
(35, '400.00', 'Départ - Arrivée', 1, '2026-07-03', 'CDG-FRA-2026-07-03-0', 22),
(36, '400.00', 'Départ - Arrivée', 1, '2026-07-14', 'DLA-NSI-2026-07-14-1', 23),
(37, '400.00', 'Départ - Arrivée', 1, '2026-07-15', 'NSI-DLA-2026-07-15-5', 23);

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

-- --------------------------------------------------------

--
-- Structure de la table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE IF NOT EXISTS `favorites` (
  `favorite_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `vol_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favorite_id`),
  UNIQUE KEY `uniq_user_vol` (`user_id`,`vol_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_vol_id` (`vol_id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4;

--
-- Déchargement des données de la table `favorites`
--

INSERT INTO `favorites` (`favorite_id`, `user_id`, `vol_id`, `created_at`) VALUES
(23, 22, 'DLA-NSI-2026-06-21-0', '2026-06-21 02:40:28'),
(29, 22, 'EBB-BKO-2026-06-21-0', '2026-06-21 03:14:26'),
(32, 22, 'DSS-DLA-2026-06-23-0', '2026-06-23 13:03:13'),
(33, 22, 'BCN-RAK-2026-06-23-6', '2026-06-23 17:04:41'),
(35, 22, 'BCN-RAK-2026-06-23-1', '2026-06-23 17:05:36'),
(36, 23, 'NSI-DLA-2026-06-25-8', '2026-06-23 17:08:50'),
(38, 23, 'NSI-DLA-2026-06-27-8', '2026-06-23 22:39:40'),
(39, 23, 'CDG-FCO-2026-06-25-5', '2026-06-23 22:41:10'),
(40, 23, 'CDG-FCO-2026-06-25-2', '2026-06-23 22:41:23'),
(41, 22, 'CDG-FCO-2026-06-30-1', '2026-06-24 14:51:41'),
(42, 22, 'CDG-FRA-2026-07-03-0', '2026-07-03 10:50:45'),
(43, 23, 'DLA-NSI-2026-07-14-1', '2026-07-14 00:26:56'),
(44, 23, 'NSI-DLA-2026-07-15-5', '2026-07-15 17:43:35');

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

DROP TABLE IF EXISTS `paiements`;
CREATE TABLE IF NOT EXISTS `paiements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reservation_id` int(11) NOT NULL,
  `notch_reference` varchar(100) DEFAULT NULL,
  `merchant_reference` varchar(100) DEFAULT NULL,
  `montant` decimal(10,2) DEFAULT NULL,
  `devise` varchar(10) DEFAULT NULL,
  `statut` varchar(30) DEFAULT NULL,
  `moyen_paiement` varchar(50) DEFAULT NULL,
  `transaction_date` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `reservation_id` (`reservation_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

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

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reservation_reference` varchar(50) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `vol_id` varchar(255) NOT NULL,
  `date_reservation` datetime DEFAULT CURRENT_TIMESTAMP,
  `nombre_adultes` int(11) DEFAULT '1',
  `nombre_enfants` int(11) DEFAULT '0',
  `classe` varchar(50) DEFAULT NULL,
  `prix_total` decimal(10,2) DEFAULT NULL,
  `devise` varchar(10) DEFAULT 'XAF',
  `statut` enum('EN_ATTENTE','PAYEE','ANNULEE') DEFAULT 'EN_ATTENTE',
  PRIMARY KEY (`id`),
  UNIQUE KEY `reservation_reference` (`reservation_reference`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

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
  `lastname` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `birthDate` date DEFAULT NULL,
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `lastname`, `birthDate`, `phone`) VALUES
(11, 'Jean miguel', 'jean.miguel@example.com', '$2b$10$BzYOP43alO8x6gBQqoPuUu58LWaSlRNUiv8cc7xazBBmbJlP3Jcmm', 'blocked', '2026-05-20 00:01:19', NULL, NULL, NULL),
(14, 'mariane fernanda', 'marianne09@gmail.com', '$2b$10$FfRU0H0k.YXcvGSjnDHb0OefsxlsVICOhcYAOvSv/GO2OSFeTK3Wu', 'user', '2026-05-21 21:48:56', NULL, NULL, NULL),
(15, 'MBERE TEMWA JOSUE', 'josuemberetemwa@gmail.com', 'OAUTH_GOOGLE', 'user', '2026-05-24 00:06:03', NULL, NULL, NULL),
(17, 'test', 'test@gmail.com', '$2b$10$dDUnen/7gW79wujWduMRQefIoawiqQu5cgeWmOj0mUesMCazeYhHW', 'user', '2026-05-24 23:28:58', NULL, NULL, NULL),
(19, 'pitou', 'pitou@gmail.com', '$2b$10$q6DvmWevK9mB61nKr3tUm.hiTTfQ6M8oI4tiGyUiyl1mAk2GtTj6a', 'user', '2026-05-31 00:19:30', NULL, NULL, NULL),
(21, '1er juin', 'juin@gmail.com', '$2b$10$VPbd/TJIbTuP8cswC1N/meitx8e0s7VFrUQ0DfOwwueXTMzW2Gf1e', 'admin', '2026-06-02 01:15:25', NULL, NULL, NULL),
(22, 'mai', 'mai@gmail.com', '$2b$10$uNMjwdQIH9VXb40gJS.THe5NrjEvFzFpMlei3v.6Q.OCEKOwwmbfq', 'admin', '2026-06-16 23:24:13', NULL, NULL, NULL),
(23, 'Miguel', 'miguelkamdem92@gmail.com', '$2b$10$6vISZIC71MGn5akPCjatU.uSc0If39LdpzSa.4dWNxg9/f.t6PWnS', 'admin', '2026-06-20 00:35:16', 'Kamdem', NULL, '237654994861'),
(24, 'juillet', 'juillet@gmail.com', '$2b$10$kow2X2x3Y9hEgpP0euJ1teR2GExN/P/flxksJcLZXmcCvT2ni4QTi', 'user', '2026-07-20 02:38:48', NULL, NULL, NULL);

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
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
