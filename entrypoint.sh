#!/bin/sh

echo "Aguardando o banco de dados iniciar..."
sleep 10

echo "Rodando as migrations do sequelize..."
npx sequelize-cli db:migrate

echo "Rodando os seeders do sequelize..."
npx sequelize-cli db:seed:all

#Executando o comando principal passado para o container, no caso, "node src/server.js"
echo "Iniciando a aplicação..."
exec npm run start:watch