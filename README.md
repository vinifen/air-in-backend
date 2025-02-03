## Air In

### 1. Adicionar o arquivo `.env` na raiz do projeto com a seguinte estrutura (os valores das variáveis são somente exemplos):

```env
SERVER_HOSTNAME=localhost
SERVER_PORT=1111

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=abc321
DB_NAME=air_in_db

CORS_ORIGIN=http://localhost:4200

WEATHER_API_KEY=apikey

JWT_SESSION_KEY=jwtsessiontokenkey
JWT_REFRESH_KEY=jwtrefreshtokenkey
 
```

#### Nota: A aplicação funcionará sem o arquivo .env, mas usará valores padrão, o que pode resultar em erros ou comportamentos inesperados.

### 2. Instalar o TypeScript
```bash
npm install typescript 
```
### 3. Baixar as dependências do projeto
```bash
npm install
```
### 4. Baixar ts-node para rodar a aplicação
```bash
npm install ts-node 
```
### 5. Baixar ts-node-dev para rodar a aplicação em modo de desenvolvimento
O ts-node-dev permite que a aplicação seja atualizada automaticamente sempre que houver alterações no código, sem precisar reiniciar o servidor manualmente.

```bash
npm install ts-node-dev --save-dev
```
### 6. Rodar a aplicação no modo de desenvolvimento
Para rodar a aplicação no modo de desenvolvimento (onde as alterações no código serão aplicadas automaticamente), execute:

```bash
npm run dev
```
Isso utilizará o script definido no package.json para iniciar o servidor e monitorar as mudanças no código.

### 7. Rodar a aplicação diretamente com ts-node
Caso queira rodar a aplicação sem a funcionalidade de recarregamento automático, utilize o ts-node diretamente:
```bash
ts-node src/app.ts
```
