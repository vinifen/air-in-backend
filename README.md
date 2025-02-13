# Air-in Backend
#### v-1.1

Air-in é um aplicativo desenvolvido por Vinicius FN, para pesquisa do clima em qualquer cidade do mundo. Foi criado com o objetivo de aprimorar habilidades no desenvolvimento de software web.

Esse repositório é um dos três criados para o desenvolvimento do projeto, sendo os outros dois:
- frontend: https://github.com/vinifen/air-in
- docker: https://github.com/vinifen/air-in-docker

## Instalação:

Para uma instalação completa e simplificada, recomenda-se utilizar a versão Docker e seguir as instruções do repositório correspondente.


Certifique-se de ter os seguintes itens instalados: 
- git:  `sudo apt install git-all`
- mysql-server: `sudo apt install mysql-server`
- node.js: `sudo apt install nodejs` 
- npm: `sudo apt install npm` 

### Criar chave API 
Primeiramente é necessário criar uma chave API em: https://openweathermap.org/api


### Clonar repositório:

```bash
git clone https://github.com/vinifen/air-in-backend.git
```

### Criar banco de dados

Ao clonar o repositório, existirá dentro de db o arquivo air-in-db.sql
Você pode manualmente colar o código para dentro do mysql-server ou usar o comando abaixo, editando o caminho do arquivo.

```bash
mysql < /caminho/para/air-in-db.sql
```


### Criar .env

Criar na raíz do projeto o arquivo `.env` para a configuração geral.
Siga o modelo abaixo e altere WEATHER_API_KEY para sua chave gerada.
(As configurações padrões funcionam com o banco de dados)

```.env
SERVER_HOSTNAME=localhost
SERVER_PORT=1111

DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=abc321
DB_NAME=air_in_db

CORS_ORIGIN=http://localhost:4200

WEATHER_API_KEY=yourkeyhere

JWT_SESSION_KEY=yourjwtsessionkey
JWT_REFRESH_KEY=yourjwtrefreshkey 
 
COOKIE_SECURE=0
```

### Instalar dependências:

```bash
npm install
```

### Rodar aplicação em modo de desenvolvimento:

```bash
npm run dev
```

### Fazer Build:

Caso deseje fazer build do projeto utilize o comando abaixo:

```bash
npm run build
```

### Iniciar aplicação:

Após o build, inicie a aplicação com o comando:

```bash
npm run start
```



