const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const UserDAO = require('../domain/repositories/userRepository.js');

const serviceInsertUser = async (data, res) => {
  try {
   // Aplicar regras de negócio aqui...


    const resultInsert = await UserDAO.create(data) 

    return resultInsert.id;

  } catch (err) {
    throw new Error(err);
  }
};

// const serviceAuthenticateUser = async ({ email, senha }) => {

//     const con = await connectToDatabase();
//     const sql = "SELECT * FROM users WHERE email= ?";
//     const [rows] = await con.execute(sql, [email]);
//     const user = rows[0];

//     if (!user) {
//       throw new Error("USER_NOT_FOUND");
//     }

//     const passwordIsMatch = await bcrypt.compare(senha, user.senha);

//     if(!passwordIsMatch){
//       throw new Error("INVALID_PASSWORD");
//     }
    
//       const payload = {
//         id: user.id,
//         email: user.email
//       }

//       console.log(process.env.SECRET);

//       const token = jwt.sign(payload, process.env.SECRET, {
//         expiresIn: '30m'
//       })
      
//       return {user, token};
// };

// const serviceListAllUsers = async (req, res) => {
//   try {
//     const con = await connectToDatabase();
//     const sql = "SELECT * FROM users";
//     const [rows] = await con.execute(sql);

//     if(rows.length === 0){
//       return { content: false, listUsers: []};
//     }

//     return { content: true, listUsers: rows}
//   } catch (err) {
//     throw new Error(err.code);
//   }
// };

const serviceFindById = async (id) => {
  const numericId = parseInt(id, 10);

  if(!Number.isInteger(numericId) || numericId <= 0){
    throw new Error("ID de usuário inváido");
  }

  const user = await UserDAO.findById(numericId);

  if(!user){
    throw new Error("Usuário não encontrado");
  }

  return user;
}

module.exports = {
  // serviceAuthenticateUser,
  serviceInsertUser,
  // serviceListAllUsers,
  serviceFindById
}
