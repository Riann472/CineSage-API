const express = require('express')
const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const app = express();

app.post('/addfilme', (req, res) => {
    if (!req.body) {
        console.log(req.body)
        return res.json({ a: "n tem corpo", body: req.body })

    } else {
        console.log(req.body)
        return res.json({ a: "tem corpo", body: req.body })
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`)
})