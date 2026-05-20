// const bcrypt = require("bcryptjs");
// const db = require("../config/connexionBD");

// // inscription d'un nouvel utilisateur

// const registerUser = (req, res) => {
//   const { name, email, password } = req.body;

//   // validation des champs côté serveur

//   if (!name || !email || !password) {
//     return res.status(400).json({ message: "Tous les champs sont requis" });
//   }

//   db.query(
//     "SELECT * FROM users WHERE email = ?",
//     [email],
//     async (err, results) => {
//       if (err) {
//         console.error(err);
//         return res.status(500).json({ message: "Erreur serveur" });
//       }

//       // verification de l'existance de l'email dans la base de données

//       if (results.length > 0) {
//         return res.status(409).json({ message: "Cet email est déjà utilisé" });
//       }

//       // hachage du mot de passe avec bcrypt (10 rounds)

//       const hashedPassword = await bcrypt.hash(password, 10);

//       // insertion de l'utilisateur dans la base de données

//       db.query(
//         "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
//         [name, email, hashedPassword],
//         (err2, result) => {
//           if (err2) {
//             console.error(err2);
//             return res
//               .status(500)
//               .json({ message: "Erreur lors de l'inscription" });
//           }
//           // reponse avec succès si l'utilisateur est créé avec succès

//           return res.status(201).json({
//             message: "Utilisateur créé avec succès",
//             userId: result.insertId,
//           });
//         },
//       );
//     },
//   );
// };

// module.exports = { registerUser };


const bcrypt = require("bcryptjs");
const connectDB = require("../config/connexionBD");

async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    // Récupération de l'instance de la base de données
    const db = await connectDB();

    // Remplacement de db.query par db.execute
    const [existingUsers] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Cet email est déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.execute(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    return res.status(201).json({
      message: "Utilisateur créé avec succès",
      userId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

module.exports = { registerUser };
