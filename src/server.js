require('dotenv').config();
const app = require('./config/express')();
const path = require('path');
const { sequelize } = require('./infra/database/models');
const userRoutes = require('./interface/routes/userRoutes');

app.use('/user', userRoutes);

app.get('/', (req, res) => {
    console.log('API rodando!!');
});

app.listen(3333, async() => {
    try{
        await sequelize.authenticate();
        console.log('Conectado com o banco!!');

        await sequelize.sync({ force: true });
        console.log('Tabelas sincronizadas com sucesso!');
    }catch(error){
        console.error('Erro ao conectar ou sincronizar com o banco', error);
    }
});
