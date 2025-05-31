require('dotenv').config();
const app = require('./config/express')();
const path = require('path');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');

app.use('/user', userRoutes);

app.get('/', (req, res) => {
    console.log('API rodando!!');
});

app.listen(3333, async() => {
    try{
        await sequelize.authenticate();
        console.log('Conectado com o banco!!');
    }catch(error){
        console.error('Não conectado com o Banco', error);
    }
});
