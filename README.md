# Comandos Docker

Criar o arquivo `docker-compose.yml` na raíz do projeto.

```bash
# Roda o docker no modo detached (Ou seja, em segundo plano)
docker compose up -d

# visualizar containeres
docker ps

# Mostra logs de execução de um container
docker logs <id_container>
```

# Comandos Prisma

```bash
# Inicia um projeto prisma
npx prisma init

# Atualiza as migrations com base nas atualizações realizadas
npx prisma migrate dev

# Abre a visualização do banco de dados
npx prisma studio



```
