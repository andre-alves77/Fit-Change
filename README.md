# Projeto Interdisciplinar II - Sistemas de Informação ESPM

<p style="text-align: center;">
    <a href="https://www.espm.br/cursos-de-graduacao/sistemas-de-informacao/"><img src="https://avatars.githubusercontent.com/u/49880458?s=200&v=4" alt="Sistemas de Informação ESPM" style="height: 200px; width: 200px;"/></a>
</p>

# Sistema de Controle de Dispensa

### 2024-01

## Integrantes
- [Nome](https://github.com/nome/)

## Descrição do Projeto

### Problema

Problema

### Objetivo Final

Objetivo Final

### Principais Recursos

Principais Recursos

# Detalhes de Configuração

Para gerar o arquivo `public/css/bootstrap.min.css` é necessário instalar o pacote `sass` através do comando abaixo:

`npm i -g sass`

Em seguida, é necessário executar o comando abaixo para atualizar o arquivo `public/css/bootstrap.min.css` sempre que algum arquivo `scss` for alterado:

`npm run sass`

Para ajustar o estilo e outras configurações, de preferência, alterar o arquivo `scss/_variables.scss`. Em seguida, se ainda precisar, alterar os arquivos `scss/_xxx.scss`, `scss/navs/_xxx.scss` ou `scss/utilities/_xxx.scss`.

Para funcionar corretamente, devem ser criados os seguintes arquivos/pastas nos caminhos especificados, com o conteúdo especificado:

Para funcionar corretamente, devem ser criados os seguintes arquivos/pastas nos caminhos especificados, com o conteúdo especificado:

- O arquivo `.env` deve ser criado em `/`, com o conteúdo abaixo:
```
mysqlhost=localhost
mysqlport=3306
mysqluser=[USUÁRIO DO BANCO]
mysqlpassword=[SENHA DO USUÁRIO DO BANCO]
mysqldatabase=[NOME DO BANCO]
```

- A pasta `alimentos` deve ser criada em `/public/img`

# Licença

Este projeto é licenciado sob a [MIT License](https://github.com/tech-espm/inter-2sem-2024-diet-control/blob/main/LICENSE).
