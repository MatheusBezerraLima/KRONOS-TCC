const express = require('express'); 
const path = require('path'); 
// const { fileURLToPath } = require('url') 'url';
// const { dirname } = require() 'path';
const cookieParser = require("cookie-parser");


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

var app = express()

// Setando a engine que estou utilizando no projeto.
app.set('view engine', 'ejs');
app.set('views', './app/views')

app.use(express.urlencoded( {extended: true}));
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(cookieParser()); // <- Isso é essencial para req.cookies funcionar

const config = () => {
    return app;
}

module.exports = config;

console.log("Modulo carregando!!");


