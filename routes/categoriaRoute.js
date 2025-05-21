const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient();
const auth = require('../middlewares/auth')

router.get('/', auth, (req, res) => {
    return res.json(req.user)
})

router.post('/addcategoria', async (req, res) => {
    if (!req.body.nome) return res.json({ error: "Insira um nome" })

    try {
        console.log("aqui")
        const categoria = await prisma.categoria.create({
            data: {
                nome: req.body.nome
            }
        })
        res.json(categoria)
    } catch (err) {
        res.json({ error: "Erro ao adicionar categoria ao banco de dados", detalhes: err.message })
    }
})

module.exports = router