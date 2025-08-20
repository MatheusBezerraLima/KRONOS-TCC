require('dotenv').config();
const app = require('./config/express')();
const path = require('path');
const { sequelize } = require('./infra/database/models');
const userRoutes = require('./interface/routes/userRoutes');
const adminRoutes = require('./interface/routes/adminRoutes');
const { createServer } = require('node:http');
const { Server } = require("socket.io");
const taskRoutes = require('./interface/routes/taskRoutes');

const PORT = process.env.PORT || 3000;

app.use('/user', userRoutes);   
app.use('/admin', adminRoutes)
app.use('/tasks', taskRoutes);

const server = createServer(app);
const io = new Server(server, {
    // Recurso para armazenar temporariamente os eventos enviados pelo servidor.
    connectionStateRecovery: {}
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/html/index.html'));
});

// Log para conecão de um novo usuário 
io.on("connection", (socket) => {
    console.log("Usuário logado, ID:", socket.id);

    // Log para desconecção 
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(PORT, '0.0.0.0', async() => {
    console.log(`Servidor rodando na porta ${PORT}`);
    
    try{
        await sequelize.authenticate();
        console.log('Conectado com o banco!!');
    }catch(error){
        console.error('Erro ao conectar ou sincronizar com o banco', error);
    }
});
