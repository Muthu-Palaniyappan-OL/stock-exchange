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

app.post('/api/v1/order', (req, res) => {
    if (req.body.stock === undefined && typeof req.body.price === undefined && typeof req.body.qty === undefined && typeof req.body.dp === undefined && typeof req.body.dp_client === undefined && typeof req.body.side === undefined) {
        res.status(400).json({
            message: "Not In Proper stock order placement JSON Format"
        })
        return
    }
    if (req.body.side == 0) {
        res.status(400).json({
            message: "Side Can't be zero, Check Documentation"
        })
        return
    }
    if (isNaN(req.body.price) || isNaN(req.body.qty) || isNaN(req.body.dp) || isNaN(req.body.dp_client) || isNaN(req.body.side)) {
        res.status(400).json({
            message: "Json is not valid"
        })
        return
    }
    if (req.headers.jwt === undefined) {
        res.status(401).json({
            message: "Un Athuorised, JWT Header Missing"
        })
        return
    }
    jwt.verify(req.headers.jwt[0], 'privatekey', (err, decoded) => {
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
        pool.query(`SELECT * FROM create_order('${req.body.stock}', '${req.body.price}', '${req.body.qty}', '${req.body.dp}', '${req.body.dp_client}', '${req.body.side}')`, (error, results) => {
            if (error) {
                throw error
            }

            res.json({
                orderid: results.rows[0].create_order
            })
        })
    })
})

export default app