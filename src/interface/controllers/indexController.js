// src/interface/controllers/indexController.js
const sequelize = require('../../config/database');
const { User, Task } = require('../../infra/database/models'); // Ajuste o caminho

// Função para formatar o tempo de atividade de segundos para um formato legível
function formatUptime(seconds) {
    function pad(s) {
        return (s < 10 ? '0' : '') + s;
    }
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= (24 * 3600);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${days}d ${pad(hours)}h ${pad(minutes)}m ${pad(secs)}s`;
}

exports.renderDashboard = async (req, res) => {
    try {
        // 1. Verificar status da conexão com o banco de dados
        let dbStatus = { message: 'Conectado', ok: true };
        try {
            await sequelize.authenticate();
        } catch (error) {
            dbStatus = { message: `Erro: ${error.message}`, ok: false };
        }

        // 2. Coletar contagens do banco de dados em paralelo
        const [userCount, taskCount] = await Promise.all([
            User.count(),
            Task.count()
        ]);

        // 3. Coletar informações do ambiente e do processo
        const appInfo = {
            nodeVersion: process.version,
            platform: process.platform,
            environment: process.env.NODE_ENV || 'development',
            uptime: formatUptime(process.uptime()),
        };

        // 4. Coletar informações do WebSocket (usando o 'io' que anexamos no 'req')
        const websocketInfo = {
            clientsConnected: req.io.engine.clientsCount
        };

        // 5. Montar o objeto final para enviar para a view
        const dashboardData = {
            dbStatus,
            appInfo,
            websocketInfo,
            stats: {
                userCount,
                taskCount
            }
        };

        res.render('index', { data: dashboardData });

    } catch (error) {
        console.error("Erro ao gerar o dashboard:", error);
        res.status(500).send("Não foi possível carregar o painel de desenvolvedor.");
    }
};