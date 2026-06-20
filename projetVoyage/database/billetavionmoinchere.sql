-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le :  mar. 16 juin 2026 à 23:45
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
  `vol_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`favorite_id`),
  UNIQUE KEY `uniq_user_vol` (`user_id`,`vol_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_vol_id` (`vol_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

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
  `phone` int(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `created_at`, `lastname`, `birthDate`, `phone`) VALUES
(11, 'Jean miguel', 'jean.miguel@example.com', '$2b$10$BzYOP43alO8x6gBQqoPuUu58LWaSlRNUiv8cc7xazBBmbJlP3Jcmm', 'user', '2026-05-20 00:01:19', NULL, NULL, NULL),
(12, 'Miguel Kamdem', 'miguelkamdem92@gmail.com', '$2b$10$9Sn25BmIMepWl/3gDfYEmONMybRgSff4f4eHp27u98EyETZVTgA5W', 'admin', '2026-05-20 00:02:13', NULL, NULL, NULL),
(13, 'test2', 'test01@gmail.com', '$2b$10$BL1s3zg3Gvi1Hbl9pC1LjOXQRiwTZdz8wqOGOxdFiqxtHIlUJt4Iq', 'user', '2026-05-20 01:19:21', NULL, NULL, NULL),
(14, 'mariane fernanda', 'marianne09@gmail.com', '$2b$10$FfRU0H0k.YXcvGSjnDHb0OefsxlsVICOhcYAOvSv/GO2OSFeTK3Wu', 'user', '2026-05-21 21:48:56', NULL, NULL, NULL),
(15, 'MBERE TEMWA JOSUE', 'josuemberetemwa@gmail.com', 'OAUTH_GOOGLE', 'user', '2026-05-24 00:06:03', NULL, NULL, NULL),
(17, 'test', 'test@gmail.com', '$2b$10$dDUnen/7gW79wujWduMRQefIoawiqQu5cgeWmOj0mUesMCazeYhHW', 'user', '2026-05-24 23:28:58', NULL, NULL, NULL),
(19, 'pitou', 'pitou@gmail.com', '$2b$10$q6DvmWevK9mB61nKr3tUm.hiTTfQ6M8oI4tiGyUiyl1mAk2GtTj6a', 'user', '2026-05-31 00:19:30', NULL, NULL, NULL),
(20, 'qwerty', 'qwerty@gmail.com', '$2b$10$6Emwf5QRLFN1.W6BB52ofeZOmutPNt9KL9BpukDa.KpcolJzwQN/y', 'user', '2026-05-31 00:33:25', NULL, NULL, NULL),
(21, '1er juin', 'juin@gmail.com', '$2b$10$VPbd/TJIbTuP8cswC1N/meitx8e0s7VFrUQ0DfOwwueXTMzW2Gf1e', 'admin', '2026-06-02 01:15:25', NULL, NULL, NULL),
(22, 'mai', 'mai@gmail.com', '$2b$10$uNMjwdQIH9VXb40gJS.THe5NrjEvFzFpMlei3v.6Q.OCEKOwwmbfq', 'user', '2026-06-16 23:24:13', NULL, NULL, NULL);

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
