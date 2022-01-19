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

app.put('/api/v1/order/:id', (req, res) => {
    if (req.params.id === undefined && typeof req.body.price === undefined && typeof req.body.qty === undefined) {
        res.status(400).json({
            message: "Not In Proper stock order placement JSON Format"
        })
        return
    }
    if (isNaN(req.body.price) || isNaN(req.body.qty)) {
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
        console.log(`SELECT * FROM update_order('${req.params.id}', '${req.body.price}')`);
        pool.query(`SELECT * FROM update_order('${req.params.id}', '${req.body.price}', '${req.body.qty}')`, (error, results) => {
            if (error) {
                throw error
            }

            res.json({
                updated: results.rows[0].update_order
            })
        })
    })
})
export default app