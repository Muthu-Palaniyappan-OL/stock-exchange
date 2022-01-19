import express from "express";
import bodyParser from 'body-parser'
import jwt from 'jsonwebtoken'
import { Pool } from 'pg'
const pool = new Pool({
    user: 'Muthu',
    host: 'localhost',
    database: 'stockexchange',
    password: '12345678',
    port: 5432,
})

const app = express()
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));

app.get('/api/v1/stock/:id', (req, res) => {
    if (req.params.id === undefined) {
        res.status(400).json({
            message: "Id missing"
        })
        return
    }
    if (req.headers.jwt === undefined) {
        res.status(401).json({
            message: "Un Athuorised, JWT Header Missing"
        })
        return
    }
    if (typeof req.headers.jwt != "string") {
        res.status(401).json({
            message: "More Than One JWT Named Headers"
        })
        return
    }
    jwt.verify(req.headers.jwt, 'privatekey', (err, decoded) => {
        try {
            if (err) {
                throw err
            }
        }
        catch (e) {
            console.log(e)
            res.status(401).json({
                message: "UnAuthorised, JWT Header Missing"
            })
            return
        }
        pool.query(`SELECT * FROM stock_info('${req.params.id}')`, (error, results) => {
            if (error) {
                throw error
            }

            res.json(results.rows[0])
        })
    })
})

export default app