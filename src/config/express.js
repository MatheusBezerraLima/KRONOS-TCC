import express from 'express'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cookieParser from "cookie-parser";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

var app = express()

// Setando a engine que estou utilizando no projeto.
app.set('view engine', 'ejs');
app.set('views', './app/views')

app.use(express.urlencoded( {extended: true}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser()); // <- Isso é essencial para req.cookies funcionar

export const config = () => {
    return app;
}

console.log("Modulo carregando!!");


