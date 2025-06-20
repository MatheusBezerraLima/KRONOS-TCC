const express = require('express'); 
const path = require('path'); 
const methodOverride = require('method-override');
const cookieParser = require("cookie-parser");

var app = express()

// Setando a engine que estou utilizando no projeto.
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.urlencoded( {extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.resolve(__dirname, '..', 'public')));
app.use(cookieParser()); // <- Isso é essencial para req.cookies funcionar

const config = () => {
    return app;
}

module.exports = config;

console.log("Modulo carregando!!");


