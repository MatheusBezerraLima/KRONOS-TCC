FROM node:20.17.0 

# Instala o utilitário dos2unix para corrigir quebras de linha
RUN apt-get update && apt-get install -y dos2unix

# Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# Copiando o package.json e package-lock.json
COPY package*.json ./

# Intalando as dependencias  
RUN npm install

# Copiando o restante dos arquivos para o containder
COPY . .

# Converte o arquivo de entrypoint para o formato Unix (LF)
RUN dos2unix /usr/src/app/entrypoint.sh

# Dando permissão de execução para o script de entrypoint.
RUN chmod +x /usr/src/app/entrypoint.sh

# Configurando o entrypoint para usar o script
ENTRYPOINT  [ "/usr/src/app/entrypoint.sh"]

# Difinindo o comando padrão para iniciar a aplicação 
CMD ["node", "src/server.js"]