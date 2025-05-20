const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('./generated/prisma')
require('dotenv').config()

const app = express();
const prisma = new PrismaClient();

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.json("oi")
})

app.post('/addcategoria', async (req, res) => {
    if (!req.body.nome) return res.json({ error: "Insira um nome" })

    try {
        const categoria = await prisma.categoria.create({
            data: {
                nome: req.body.nome
            }
        })
        res.json(categoria)
    } catch (err) {
        res.json({ error: "Erro ao adicionar categoria ao banco de dados" })
    }
})

app.post('/addfilme', async (req, res) => {
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

app.post('/register', (req, res) => {
    const { user, password, catId } = req.body

    if (!user || !password) return res.json({ error: "Informe os campos obrigatorios: usuario e senha" })


})

app.listen(process.env.PORT, () => {
    console.log(`Server rodando em: http://localhost:${process.env.PORT}`)
})