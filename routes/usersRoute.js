const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const router = express.Router();
const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient();

router.post('/register', async (req, res) => {
    const { user, password, catId } = req.body

    if (!user || !password) return res.json({ error: "Informe os campos obrigatorios: usuario e senha" })

    const findUser = await prisma.user.findUnique({ where: { user } })
    if (findUser) return res.json({ error: "Esse usuário ja existe, tente outro." })

    bcrypt.hash(password, 10)
        .then(async hash => {
            const createUser = await prisma.user.create({
                data: {
                    user: user,
                    password: hash
                }
            })
            return res.json({ id: createUser.id, user })
        })
        .catch(err => res.json({ error: "Erro ao inserir usuario." }))
    // err.message pra ver o erro
})

router.post('/login', async (req, res) => {
    const { user, password } = req.body

    if (!user || !password) return res.json({ error: "Informe os campos obrigatorios: usuario e senha" })

    const findUser = await prisma.user.findUnique({ where: { user } })
    if (!findUser) return res.json({ error: "Usuario não encontrado." })

    bcrypt.compare(password, findUser.password)
        .then(match => {
            if (!match) return res.json({ error: "Senha incorreta." })
            token = jwt.sign({ id: findUser.id, user }, process.env.SECRET)
            return res.json({ message: "Logado com sucesso", token: token, user: { id: findUser.id, user } })
        })
})

module.exports = router