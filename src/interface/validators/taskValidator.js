const { z } = require('zod');

const createTaskSchema = z.object({
    body: z.object({
        // Titulo
        titulo: z.string({ 
            required_error: "O título é obrigatório.", 
            invalid_type_error: "O título deve ser um texto"
        })
        .min(3, { message: " O título deve ter no mínimo 3 caracteres"})
        .max(255, { message: " O título deve ter no mínimo 255 caracteres"}),

        // Descrição
        descricao: z.string({
            invalid_type_error: "A descrição deve ser um texto.",
        })
        .max(1000, { message: 'A descrição não pode exceder 1000 caracteres.' })
        .optional()
        .nullable(),

        // Prioridade
        prioridade: z.enum(["Baixa", "Média", "Alta"], {
            errorMap: () => ({ message: "A prioridade deve ser 'Baixa', 'Média' ou 'Alta'."}),
        })
        .optional(),

        // Categoria (categoria_id)
        categoria_id: z
        .number({
            invalid_type_error: 'O ID da categoria deve ser um número.',
        })
        .int()
        .positive({ message: 'O ID da categoria deve ser um número positivo.' })
        .optional()
        .nullable(),

        // Status (status_id)
        status_id: z
        .number({
            invalid_type_error: 'O ID do status deve ser um número.',
        })
        .int()
        .positive({ message: 'O ID do status deve ser um número positivo.' })
        .optional()
        .nullable(),

        // Projeto (projeto_id)
        projeto_id: z
        .number({
            invalid_type_error: 'O ID do projeto deve ser um número.',
        })
        .int()
        .positive({ message: 'O ID do projeto deve ser um número positivo.' })
        .optional()
        .nullable(),

        // Usuários Atribuídos (assignment)
        // array de IDs de usuário
        usuarios_atribuidos: z
        .array(
            z.number({
            invalid_type_error: 'Cada ID de usuário deve ser um número.',
            }).int().positive(),
            {
            invalid_type_error: 'A lista de usuários atribuídos deve ser um array de números.',
            }
        )
        .optional(),
    })
    
});

module.exports = createTaskSchema;