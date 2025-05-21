const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma')
const prisma = new PrismaClient();

router.post('/addfilme', async (req, res) => {
    const { nome, img, catId } = req.body;

    if (!nome || !img) {
        return res.json({ error: "Informe os campos obrigatórios: nome e imagem." });
    }

    if (!Array.isArray(catId) || catId.length === 0) {
        return res.json({ error: "Informe ao menos uma categoria válida." });
    }

    try {
        const categorias = await prisma.categoria.findMany({ where: { id: { in: catId } } });
        if (categorias.length != catId.length) {
            return res.json({ error: "Uma ou mais categorias não foram encontradas." });
        }

        try {
            const filme = await prisma.filmes.create({
                data: {
                    nome,
                    img,
                    categorias: {
                        connect: categorias.map(categoria => ({ id: categoria.id }))
                    }
                }
            });

            return res.json(filme);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Erro ao criar filme", detalhes: err.message });
        }
    } catch (err) {
        return res.json({ error: "Erro ao pegar categorias" });
    }
});

module.exports = router