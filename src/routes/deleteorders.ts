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

app.delete('/api/v1/order/:id', (req, res) => {
    if (req.params.id === undefined) {
        res.status(400).json({
            message: "Parameter is not specifed"
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
        pool.query(`SELECT * FROM delete_order('${req.params.id}')`, (error, results) => {
            if (error) {
                throw error
            }

            res.json({
                deleted: results.rows[0].delete_order
            })
        })
    })
})

export default app