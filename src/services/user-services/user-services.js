import { json, response } from "express";
import { connectToDatabase } from "../connect.js";
import jwt from "jsonwebtoken";
import * as bcrypt from 'bcrypt';

export const serviceInsertUser = async ({ nome, email, senhaHash }, res) => {
  try {
    const con = await connectToDatabase();
    const sql = "INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)";

    await con.execute(sql, [nome, email, senhaHash]);

    res.status(201).send("Usuario inserido com sucesso");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao inserir dados");
  }
};

export const serviceAuthenticateUser = async ({ email, senha }) => {

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

export const serviceListAllUsers = async (req, res) => {
  try {
    const con = await connectToDatabase();
    const sql = "SELECT * FROM users";
    const [rows] = await con.execute(sql);

    res.status(200).json({
      message: "Lista de Usuarios",
      data: rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao listar usuários" + err);
  }
};
