import { config } from './config/express.js'
import { connectToDatabase } from './services/connect.js';
import { __dirname } from './utils/paths.js';
import path from 'path'; // Importa a função join do módulo path
import { getRegisterUser, getAuthenticateUser, getListAllUsers, verifyAuthToken} from './controllers/user-controller.js';

const app = config();


app.listen(3333, (error) => {
    if(error){
        console.log("Erro ao executar o servidor");
        console.log("Erro:" + error);
        return;
    }
    console.log("Servidor rodando na porta " + 3333);
});

app.get('/', (req , res) => {
});

app.get('/user/login', (req, res)=> {
    res.sendFile(path.join(__dirname, './public/html/login.html'));
})

app.post('/user/login', async(req, res) => {
    await getAuthenticateUser(req, res);
})

app.get('/user/register', (req , res)=> {
    res.sendFile(path.join(__dirname, './public/html/register.html'));
})

app.post('/user/register', async (req , res) => {
    await getRegisterUser(req, res);
})

app.get('/user/list', verifyAuthToken, async(req, res) => {
    await getListAllUsers(req, res)
})