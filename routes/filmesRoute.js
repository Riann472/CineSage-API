const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../generated/prisma');
const adminAuth = require('../middlewares/adminAuth');
const auth = require('../middlewares/auth');
const prisma = new PrismaClient();

router.post('/addfilme', adminAuth, async (req, res) => {
    const { nome, descricao, img, categoriaIds } = req.body;

    if (!nome || !descricao || !Array.isArray(categoriaIds) || categoriaIds.length === 0) {
        return res.status(400).json({ error: "Preencha todos os campos e selecione ao menos uma categoria." });
    }

    // Verifica se é uma URL de imagem válida (extensão simples)
    const imagemValida = (url) => {
        return typeof url === 'string' && url.match(/^https?:\/\/.+\.(jpeg|jpg|png|gif|webp)$/i);
    };

    const imagemFinal = imagemValida(img)
        ? img
        : 'https://via.placeholder.com/300x450.png?text=Sem+Imagem';

    try {
        const novoFilme = await prisma.filmes.create({
            data: {
                nome,
                descricao,
                img: imagemFinal,
                categorias: {
                    connect: categoriaIds.map(id => ({ id }))
                }
            },
            include: {
                categorias: true
            }
        });

        res.json({ message: "Filme adicionado com sucesso", filme: novoFilme });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro ao adicionar filme", detalhes: err.message });
    }
});

router.get('/filmes', async (req, res) => {
    try {
        const filmes = await prisma.filmes.findMany();
        res.json(filmes);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar filmes.', err: err.message });
    }
});

router.get('/filmes/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    // Exemplo: buscar no banco de dados pelo id (aqui só array simulado)
    const filme = await prisma.filmes.findUnique({ where: { id } })

    if (!filme) {
        return res.status(404).json({ error: 'Filme não encontrado' });
    }

    res.json(filme);
});

router.get('/recomendados/:userId', auth, async (req, res) => {
    const { userId } = req.params;
    console.log(userId)
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { categorias: true }
        });
        console.log(user)
        if (!user || user.categorias.length === 0) {
            return res.json([]); // Sem categorias → sem recomendação
        }

        const filmes = await prisma.filmes.findMany({
            where: {
                categorias: {
                    some: {
                        id: { in: user.categorias.map(cat => cat.id) }
                    }
                }
            }
        });

        res.json(filmes);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar recomendados.', err: err.message });
    }
});


module.exports = router