const jwt = require('jsonwebtoken')
const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient()

async function auth(req, res, next) {
    const token = req.headers['token']
    if (!token) return res.status(401).json({ error: "O usuário precisa estar logado pra utilizar essa função." })

    try {
        const decoded = jwt.verify(token, process.env.SECRET)

        // Busca o usuário no banco incluindo as categorias
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            include: {
                categorias: true
            }
        })

        if (!user) return res.status(404).json({ error: "Usuário não encontrado" })

        // Remove a senha antes de repassar
        const { password, ...userSemSenha } = user
        req.user = userSemSenha

        next()
    } catch (err) {
        return res.status(401).json({ error: 'Token inválido ou expirado.' })
    }
}

module.exports = auth
