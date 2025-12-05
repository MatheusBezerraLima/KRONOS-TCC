# Use uma imagem base Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copia o script de entrada
COPY entrypoint.sh .

# Copia os arquivos de configuração do Node (package.json e package-lock.json)
# para que o npm install possa ser executado no container
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código da aplicação
# Como você está usando "volumes" no docker-compose, esta linha pode ser opcional 
# para desenvolvimento, mas é CRUCIAL para produção.
COPY . .

# Garante que o script tenha as permissões de execução
RUN chmod a+x entrypoint.sh

# Corrige quebras de linha (se o arquivo foi criado no Windows)
RUN sed -i 's/\r$//' entrypoint.sh

# Define o script de entrada do container
# O comando ENTRYPOINT substitui o 'command' que você executaria.
ENTRYPOINT ["./entrypoint.sh"]

