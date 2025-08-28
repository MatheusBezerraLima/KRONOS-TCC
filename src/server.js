require('dotenv').config();
const app = require('./config/express')();
const path = require('path');
const { sequelize } = require('./infra/database/models');
const userRoutes = require('./interface/routes/userRoutes');
const adminRoutes = require('./interface/routes/adminRoutes');
const indexController = require('./interface/controllers/indexController');
const { createServer } = require('node:http'); // Importando o módulo http.createServer nativo do Node
const { Server } = require("socket.io"); // Importando o server do socket.io
const taskRoutes = require('./interface/routes/taskRoutes');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");
const verifyAuthToken = require('./interface/middlewares/authenticateToken');

const PORT = process.env.PORT || 3000;
const server = createServer(app); // Criando um servidor http usando o app Express.
// Criando um instancia do socket.io atrelada ao servidor http
const io = new Server(server, {
    // Recurso para armazenar temporariamente os eventos enviados pelo servidor.
    connectionStateRecovery: {}
});

// middleaware para anexar o io() na requisição para ser usado no controler
app.use((req, res, next) => {
    req.io = io;
    return next();
})

io.use((socket, next) => {
    const req = socket.request;

    cookieParser(process.env.SECRET)(req, {}, (err) => {
        if(err){
            return next(new Error('Erro no cookie-parser.'));
        }

        const token = req.cookies.authToken;

        if(!token){
            return next(new Error('Falha na autenticação: token não encontrado no cookie.'));
        }

        jwt.verify(token, process.env.SECRET, (err, decoded) => {
            if(err){
                return next(new Error('Falha na autenticação: token inválido.'));
            }
            socket.data.user = decoded; // Anexa os dados do usuário ao socket
            return next(); // Permite a conexão
        });
    })
});

// Log para conecão de um novo usuário 
io.on("connection", (socket) => {
    const user = socket.data.user;
    console.log(`Usuário ${user.id} (${user.email}) autenticado via cookie e conectado.`);

    // Coloca o usuario em suas salas
    socket.join(user.id.toString());

    // Log para desconexão 
    socket.on('disconnect', () => {
        console.log('❌ Usuário desconectado!', socket.id);
    });
});

app.use('/user', userRoutes);   
app.use('/admin', adminRoutes)
app.use('/tasks', taskRoutes);

app.get('/', indexController.renderDashboard);



server.listen(PORT, '0.0.0.0', async() => {
    console.log(`Servidor rodando na porta ${PORT}`);
    
    try{
        await sequelize.authenticate();
        console.log('Conectado com o banco!!');
    }catch(error){
        console.error('Erro ao conectar ou sincronizar com o banco', error);
    }
});
