import { connectToDatabase } from "../connect.js"

export const serviceInsertUser = async ({ nome, email, senha }, res) => {

  try{
    const con = await connectToDatabase();
    const sql = 'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)';
    con.execute(sql, [nome, email, senha])

    res.status(201).send('Usuario inserido com sucesso');
  }catch(err){
    console.error(err);
    res.status(500).send('Erro ao inserir dados');
  }
}

export const serviceAuthenticateUser = async({email, senha}, res) => {
    try{
      const con = await connectToDatabase();
      const sql = 'SELECT * FROM users WHERE nome= ? AND senha= ?';
      const [rows] = await con.execute(sql, [email, senha]);

      if(rows.length > 0){
        res.status(200).send('Usuario existe');
      }else{
        res.status(401).send('Usuário/senha incorretos');
      }
    }catch(err){
      console.error(err);
      res.status(500).send('Erro no servidor');      
    }
};

export const serviceListAllUsers = async(req, res) => {
  try{
    const con = await connectToDatabase();
    const sql = 'SELECT * FROM users';
    const [rows] = await con.execute(sql);

    res.status(200).json({
      message: 'Lista de Usuarios',
      data: rows
    });
  }catch(err){
    console.error(err);
    res.status(500).send('Erro ao listar usuários' + err);
  }
}