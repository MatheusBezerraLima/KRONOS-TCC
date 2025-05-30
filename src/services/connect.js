const mysql = require('mysql2/promise');

const connectToDatabase = async() => {
    try {
        var connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });
        return connection;
    } catch (err) {
        console.log(err, () => {
            console.log('Erro ao conectar com o banco!');
        });
    }
}

module.exports = connectToDatabase;