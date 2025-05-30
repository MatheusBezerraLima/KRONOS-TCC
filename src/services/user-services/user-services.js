const { connectToDatabase } = require("../connect.js");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const serviceInsertUser = async ({ nome, email, senhaHash, telefone, data_nascimento, genero, foto_perfil }, res) => {
  try {
    const con = await connectToDatabase();
    const sql = "INSERT INTO usuarios (nome, email, senha, telefone, data_nascimento, genero, foto_perfil ) VALUES (?, ?, ?, ?, ?, ?, ?)";

    const [resultInsert] = await con.execute(sql, [nome, email, senhaHash, telefone, data_nascimento, genero, foto_perfil]);

    return { sucess: true, id: resultInsert.id};

  } catch (err) {
    throw new Error(err.code);
  }
};

const serviceAuthenticateUser = async ({ email, senha }) => {

    const con = await connectToDatabase();
    const sql = "SELECT * FROM users WHERE email= ?";
    const [rows] = await con.execute(sql, [email]);
    const user = rows[0];

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const passwordIsMatch = await bcrypt.compare(senha, user.senha);

    if(!passwordIsMatch){
      throw new Error("INVALID_PASSWORD");
    }
    
      const payload = {
        id: user.id,
        email: user.email
      }

      console.log(process.env.SECRET);

      const token = jwt.sign(payload, process.env.SECRET, {
        expiresIn: '30m'
      })
      
      return {user, token};
};

const serviceListAllUsers = async (req, res) => {
  try {
    const con = await connectToDatabase();
    const sql = "SELECT * FROM users";
    const [rows] = await con.execute(sql);

    if(rows.length === 0){
      return { content: false, listUsers: []};
    }

    return { content: true, listUsers: rows}
  } catch (err) {
    throw new Error(err.code);
  }
};

module.exports = {
  serviceAuthenticateUser,
  serviceInsertUser,
  serviceListAllUsers
}
