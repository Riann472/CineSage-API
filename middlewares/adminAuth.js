const jwt = require('jsonwebtoken')

function adminAuth(req, res, next) {
    const token = req.headers['token']
    if (!token) return res.json({ error: "O usuário precisa estar logado pra utilizar essa função." })
        
    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) return res.json({ message: 'Token invalido.' });

        req.user = decoded

        if (decoded.cargo != 'admin') {
            return res.json({ error: "O usuario precisa ser um admin pra usar esta função." })
        }
        next()
    })
}

module.exports = adminAuth