const boardColumnDAO = require('../../infra/database/repositories/boardColumnRepository');
const userProjectRoleDAO = require('../../infra/database/repositories/userProjectRoleRepository');
const tasksDAO = require('../../infra/database/repositories/tasksRepository');
const sequelize = require("../../config/database");

class BoardColumnService {

    async createColumn(projectId, columnName, currentUserId) {
        // 1. Autorização: O utilizador tem permissão?
        const membership = await userProjectRoleDAO.findByUserAndProject(currentUserId, projectId);
        if (!membership || !['Criador', 'Administrador'].includes(membership.role)) {
            const error = new Error("Acesso negado: você não tem permissão para criar colunas.");
            error.statusCode = 403;
            throw error;
        }

        // 2. Lógica de Negócio: Determina a ordem da nova coluna
        const lastColumn = await boardColumnDAO.findLastByProjectId(projectId);
        const newOrder = lastColumn ? lastColumn.ordem + 1 : 1;

        // 3. Cria a coluna
        const newColumn = await boardColumnDAO.create({
            nome: columnName,
            ordem: newOrder,
            projeto_id: projectId
        });

        return newColumn;
    }

    /**
     * Renomeia uma coluna existente.
     */
    async renameColumn(columnId, newName, currentUserId) {
        // 1. Busca a coluna para obter o ID do projeto
        const column = await boardColumnDAO.findById(columnId);
        if (!column) {
            const error = new Error("Coluna não encontrada.");
            error.statusCode = 404;
            throw error;
        }

        // 2. Autorização
        const membership = await userProjectRoleDAO.findByUserAndProject(currentUserId, column.projeto_id);
        if (!membership || !['Criador', 'Administrador'].includes(membership.role)) {
            const error = new Error("Acesso negado: você não tem permissão para renomear colunas.");
            error.statusCode = 403;
            throw error;
        }

        // 3. Atualiza o nome
        const [affectedRows] = await boardColumnDAO.update(columnId, { nome: newName });
        if (affectedRows === 0) {
            throw new Error("Não foi possível renomear a coluna.");
        }

        return boardColumnDAO.findById(columnId);
    }

    /**
     * Apaga uma coluna e move as suas tarefas para a primeira coluna do board.
    //  */
    // async deleteColumn(columnId, currentUserId) {
    //     let t = await sequelize.transaction();
    //     try {
    //         // 1. Busca a coluna
    //         const columnToDelete = await boardColumnDAO.findById(columnId, { transaction: t });
    //         if (!columnToDelete) {
    //             const error = new Error("Coluna não encontrada.");
    //             error.statusCode = 404;
    //             throw error;
    //         }

    //         // 2. Autorização
    //         const membership = await userProjectRoleDAO.findByUserAndProject(currentUserId, columnToDelete.projeto_id, { transaction: t });
    //         if (!membership || !['Criador', 'Administrador'].includes(membership.role)) {
    //             const error = new Error("Acesso negado: você não tem permissão para apagar colunas.");
    //             error.statusCode = 403;
    //             throw error;
    //         }
            
    //         // 3. Lógica de Segurança: Encontra a primeira coluna para onde mover as tarefas
    //         const firstColumn = await boardColumnDAO.findFirstColumn(columnToDelete.projeto_id, { transaction: t });
    //         if (!firstColumn || firstColumn.id === columnToDelete.id) {
    //             const error = new Error("Não é possível apagar a única ou a primeira coluna do board.");
    //             error.statusCode = 400;
    //             throw error;
    //         }

    //         // 4. Move as tarefas
    //         await tasksDAO.moveTasksToNewColumn(columnToDelete.id, firstColumn.id, { transaction: t });

    //         // 5. Apaga a coluna
    //         await boardColumnDAO.delete(columnId, { transaction: t });

    //         // Se tudo correu bem, faz o commit
    //         await t.commit();
            
    //         return { message: 'Coluna apagada com sucesso e tarefas movidas.' };

    //     } catch (error) {
    //         // Se algo falhou, faz o rollback
    //         await t.rollback();
    //         if (error.statusCode) throw error;
            
    //         console.error("Falha ao apagar coluna:", error);
    //         const serverError = new Error("Não foi possível apagar a coluna.");
    //         serverError.statusCode = 500;
    //         throw serverError;
    //     }
    // }

   async deleteColumn(columnId, currentUserId) {
        let t = await sequelize.transaction();
        try {
            console.log(`--- Iniciando transação para apagar a coluna ID: ${columnId} ---`);

            const columnToDelete = await boardColumnDAO.findById(columnId, { transaction: t });
            if (!columnToDelete) {
                const error = new Error("Coluna não encontrada.");
                error.statusCode = 404;
                throw error;
            }
            console.log(`[DEBUG] Coluna a ser apagada: ID=${columnToDelete.id}, Projeto ID=${columnToDelete.projeto_id}`);

            // ... (a sua lógica de autorização) ...
            
            const firstColumn = await boardColumnDAO.findFirstColumn(columnToDelete.projeto_id, { transaction: t });
            if (!firstColumn || firstColumn.id === columnToDelete.id) {
                const error = new Error("Não é possível apagar a única ou a primeira coluna do board.");
                error.statusCode = 400;
                throw error;
            }
            console.log(`[DEBUG] Coluna de destino para as tarefas: ID=${firstColumn.id}`);

            // --- PONTO DE DEPURAÇÃO CRUCIAL ---
            console.log(`[AÇÃO] Tentando mover tarefas da coluna ${columnToDelete.id} para a coluna ${firstColumn.id}...`);
            const movedCount = await tasksDAO.moveTasksToNewColumn(columnToDelete.id, firstColumn.id, { transaction: t });
            
            // Este log vai dizer-nos exatamente quantas linhas o seu UPDATE afetou.
            console.log(`[RESULTADO] O DAO reportou que ${movedCount} tarefas foram movidas.`);

            // Adicionamos uma verificação. Se nenhuma tarefa foi movida quando esperávamos, algo está errado.
            // Por agora, vamos apenas logar, mas no futuro poderia lançar um erro.
            if (movedCount === 0) {
                console.warn('[AVISO] Nenhuma tarefa foi encontrada na coluna a ser apagada.');
            }

            console.log(`[AÇÃO] Apagando a coluna ID: ${columnId}...`);
            await boardColumnDAO.delete(columnId, { transaction: t });

            await t.commit();
            console.log("--- Transação concluída com sucesso! ---");
            
            return { message: 'Coluna apagada com sucesso.' };

        } catch (error) {
            await t.rollback();
            console.log("--- Transação revertida devido a erro. ---");
            if (error.statusCode) throw error;
            
            console.error("Falha ao apagar coluna:", error);
            const serverError = new Error("Não foi possível apagar a coluna.");
            serverError.statusCode = 500;
            throw serverError;
        }
    }
}

module.exports = new BoardColumnService();