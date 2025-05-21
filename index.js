// Importando as bibliotecas necessarias
const express = require('express')
const cors = require('cors')
require('dotenv').config()

// Inicializando app e o prisma client
const app = express();

// Middlewares
app.use(express.json())
app.use(cors())

// Declaração de rotas
const categoriasRouter = require('./routes/categoriaRoute')
const filmesRouter = require('./routes/filmesRoute')
const usersRoute = require('./routes/usersRoute')

// Middlewares de rota
app.use(categoriasRouter)
app.use(filmesRouter)
app.use(usersRoute)



// Subindo o server
app.listen(process.env.PORT, () => {
    console.log(`Server rodando em: http://localhost:${process.env.PORT}`)
})