import { application, json } from "express";
import {serviceInsertUser, serviceAuthenticateUser, serviceListAllUsers} from "../services/user-services/user-services.js";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export const verifyAuthToken = async(req, res, next) => {
    const token = req.cookies.authToken;    

    if(!token){
        return res.status(401).json({ message: "Acesso negado. Necessário realizar a autenticação "})
    }

    try{
        console.log(process.env.SECRET);
        const decoded = jwt.verify(token, process.env.SECRET);        
        next();
    }catch(err){
        console.error(err);
        return res.status(403).json({ message: "Token inválido ou expirado. "});
    }
};

export const getRegisterUser = async (req, res) => {
  const { nome, email, senha } = req.body;

  const senhaHash = await bcrypt.hash(senha, 10);

  await serviceInsertUser({ nome, email, senhaHash }, res);
};

export const getAuthenticateUser = async (req, res) => {
  const { email, senha } = req.body;

  try {
    const { user, token } = await serviceAuthenticateUser({ email, senha });
    
    res.cookie("authToken", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge:  30 * 60 * 1000
    });
    // console.log("token inserido:" + token);
    

    res.status(200).json({
      message: "Login bem sucedido!",
      token,
    });
  } catch (err) {
    if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "Usuário não existe" });
    }
    if (err.message === "INVALID_PASSWORD") {
      return res.status(401).json({ message: "Senha incorreta" });
    }
    console.error(err);
    res.status(500).json({ message: "Erro no Servidor" });
  }
};

export const deleteUser = (req, res) => {};

export const updateUser = (req, res) => {};

export const getListAllUsers = async (req, res) => {
  await serviceListAllUsers(req, res);
};

// export const getUserById = (req, res) => { /* ... */ }
// export const logoutUser = (req, res) => { /* ... */ } // opcional, se usar sessões
