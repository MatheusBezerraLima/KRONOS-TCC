const app = require('./src/config/express')();
const { sequelize } = require('./src/infra/database/models');
const userRoutes = require('./src/interface/routes/userRoutes');
const adminRoutes = require('./src/interface/routes/adminRoutes');
const projectRoutes = require('./src/interface/routes/projecRoutes');
const chatRoutes = require('./src/interface/routes/chatRoutes');
const inviteRoutes = require('./src/interface/routes/inviteRoutes');
const boardColumnRoutes = require('./src/interface/routes/boardColumnRoutes');
const friendshipRoutes = require('./src/interface/routes/friendshipRoutes');
const indexController = require('./src/interface/controllers/indexController');
const path = require('path')

const { createServer } = require('node:http'); // Importando o módulo http.createServer nativo do Node
const { Server } = require("socket.io"); // Importando o server do socket.io
const taskRoutes = require('./src/interface/routes/taskRoutes');
const subTaskRoutes = require('./src/interface/routes/subTaskRoutes');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");

const PORT = process.env.PORT || 3333;
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

    socket.on('joinRoom', (projectId) => {
        socket.join(projectId);
        console.log(`Usuário ${socket.id} entrou no projeto: ${projectId}`);
    });

    // 2. O usuário envia uma mensagem
    socket.on('chatMessage', (data) => {
        console.log(`Usuário ${data.usuario_id} mandou a mensagem: ${data.conteudo}`);
        io.to(data.projectId).emit('chatMessage', data);
    });


    // Log para desconexão 
    socket.on('disconnect', () => {
        console.log('❌ Usuário desconectado!', socket.id);
    });
});

app.use('/', userRoutes);   
app.use('/admin', adminRoutes);
app.use('/api', taskRoutes);
app.use('/api', subTaskRoutes);
app.use('/api', projectRoutes);
app.use('/api', chatRoutes);
app.use('/invites', inviteRoutes)
app.use('/api/projetos/:projectId/colunas', boardColumnRoutes);
app.use('/api/friendships', friendshipRoutes);

app.get('/landingPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'landingPage.html'))
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'homePage.html'))
});

app.get('/projetos/:projectId/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'boardPage.html'))
});

app.get('/tasks/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'pagetask.html'))
});

app.get('/projetos/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'projectPage.html'))
});

app.get('/scrum/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'scrumPage.html'))
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
