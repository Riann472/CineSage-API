const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient();
const auth = require('../middlewares/auth');
const adminAuth = require('../middlewares/adminAuth');

router.get('/getcategorias', async (req, res) => {
    const categorias = await prisma.categoria.findMany();
    res.json(categorias)
})

router.post('/addcategoria', adminAuth, async (req, res) => {
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

router.post('/addusercat', auth, async (req, res) => {
    const { userId, categoriaIds } = req.body;

    if (!userId || !Array.isArray(categoriaIds) || categoriaIds.length === 0) {
        return res.status(400).json({ error: "Envie um userId e pelo menos uma categoriaId" });
    }

    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                categorias: {
                    set: categoriaIds.map(id => ({ id })) // substitui pelas categorias novas
                }
            },
            include: {
                categorias: true
            }
        });

        res.json({ message: "Categorias atualizadas com sucesso", user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao atualizar categorias", detalhes: err.message });
    }
})

module.exports = router