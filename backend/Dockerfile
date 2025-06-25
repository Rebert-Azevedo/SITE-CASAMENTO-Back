# Dockerfile para o Backend (localizado em SITE-CASAMENTO/backend/)

# Usa uma imagem Node.js específica (versão 20 Alpine é leve e LTS)
FROM node:20-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de configuração de dependência do npm
# (package.json e package-lock.json) para o diretório de trabalho.
# Isso otimiza o cache do Docker: se esses arquivos não mudarem, as dependências
# não precisarão ser reinstaladas a cada build.
COPY package*.json ./

# Instala as dependências do Node.js.
# `--production` instala apenas as dependências de produção, tornando a imagem menor.
RUN npm install --production

# Copia os arquivos de código-fonte da sua aplicação.
# Copia o server.js da raiz do backend e a pasta src/
COPY server.js ./
COPY src/ ./src/

# Expõe a porta em que a aplicação Express escuta.
# Deve corresponder à porta configurada no seu .env (PORT=5000).
EXPOSE 5000

# Comando para iniciar a aplicação quando o contêiner for executado.
# Assume que você tem um script "start" no seu package.json que roda "node server.js".
CMD ["npm", "start"]