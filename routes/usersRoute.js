const express = require('express');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const router = express.Router();
const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient();

const auth = require('../middlewares/auth')
const adminAuth = require('../middlewares/adminAuth')

router.get('/user', auth, (req, res) => {
    return res.json(req.user)
})

router.get('/getUsers', adminAuth, async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: {
                categorias: true, // isso puxa as categorias do relacionamento N:N
            }
        });

        // Remover a senha de cada usuário
        const safeUsers = users.map(({ password, ...rest }) => rest);

        res.json(safeUsers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao buscar usuários", detalhes: err.message });
    }
});

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
                    password: hash,
                    cargo: "user"
                }
            })
            token = jwt.sign({ id: createUser.id, user, cargo: createUser.cargo }, process.env.SECRET)

            return res.json({ token: token, user: { id: createUser.id, user: createUser.user, cargo: createUser.cargo, logged: true } })
        })
        .catch(err => res.json({ error: "Erro ao inserir usuario.", err: err.message || err }))
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
            token = jwt.sign({ id: findUser.id, user, cargo: findUser.cargo }, process.env.SECRET)
            return res.json({ message: "Logado com sucesso", token: token, user: { id: findUser.id, user, cargo: findUser.cargo, logged: true } })
        })
})

router.post('/addadmin', adminAuth, async (req, res) => {
    const { id } = req.body

    try {
        const user = await prisma.user.findUnique({ where: { id } })
        if (!user) return res.json({ error: "Usuário não encontrado." })

        if (user.cargo == "admin") {
            await prisma.user.update({
                where: { id }, data: {
                    cargo: "user"
                }
            })
            res.json({ message: "Setado como usuario" })
        } else {
            await prisma.user.update({
                where: { id }, data: {
                    cargo: "admin"
                }
            })
            res.json({ message: "Setado como adm" })
        }
    } catch (err) {
        res.json({ error: "Erro o adicionar admin" })
    }
})

module.exports = router