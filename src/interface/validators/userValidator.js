const { z } = require('zod');

const phoneSchema = z.string().transform(val => val.replace(/\D/g, '')).refine(val => val.length === 11, {
    message: "O número de telefone deve ter 11 dígitos (DDD + número)."
});

const createUserSchema = z.object({
    nome:  z.string().min(3, "O nome precisa ter no mínimo 3 caracteres. "),
    email: z.string().email("Formato de email inválido!"),
    senha: z.string().min(8, "A seha deve ter no mínimo 8 caracteres"),
    telefone: phoneSchema,
});

const loginUserSchema = z.object({
    email: z.string().email("Formato de email invalido!"),
    senha: z.string().min("Senha incorreta")
});

const changePasswordUserSchema = z.object({
    currentPassword: z.string().min(8, "Senha incorreta"),
    newPassword: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmNewPassword: z.string().min(8, "A senha deve ter no mínimo 8 caracteres")
});

const findByNameUserSchema = z.object({
    nome: z.string().min(3, "O nome deve ter ao menos 3 caracteres")
});

const findByEmailUserSchema = z.object({
    email: z.string().email("Formato de email inválido")
});

module.exports = {
    createUserSchema,
    loginUserSchema,
    changePasswordUserSchema,
    findByNameUserSchema,
    findByEmailUserSchema
};