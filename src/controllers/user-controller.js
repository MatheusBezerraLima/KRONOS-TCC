import { serviceInsertUser, serviceAuthenticateUser, serviceListAllUsers } from "../services/user-services/user-services.js";

export const getRegisterUser = async(req, res) => {
    const { nome, email, senha } = req.body;
    console.log(req.body);
    
    await serviceInsertUser({ nome, email, senha }, res);
}

export const getAuthenticateUser = async (req, res) => {
    const {email, senha} = req.body;
    await serviceAuthenticateUser({email, senha}); 
}
export const deleteUser = (req, res) => {

}
export const updateUser = (req, res) => {
}

export const getListAllUsers = async(req, res) => {
    await serviceListAllUsers(req, res);
}
// export const getUserById = (req, res) => { /* ... */ }

// export const getAllUsers = (req, res) => { /* ... */ }

// export const logoutUser = (req, res) => { /* ... */ } // opcional, se usar sessões