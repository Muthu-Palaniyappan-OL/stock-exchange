import express from "express";
import bodyParser from 'body-parser'
import path from "path"
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

app.get('/admin/orders/all/', (req, res) => {
    if (req.ip != '::1') {
        res.status(401).json({
            message: "your not allowed to acess"
        })
        return
    }
    pool.query(`SELECT * FROM allorders()`, (error, results) => {
        if (error) {
            throw error
        }

        res.json(results.rows)
    })

})

app.get('/admin/stocks/all/', (req, res) => {
    if (req.ip != '::1') {
        res.status(401).json({
            message: "your not allowed to acess"
        })
        return
    }
    pool.query(`SELECT * FROM allstocks()`, (error, results) => {
        if (error) {
            throw error
        }

        res.json(results.rows)
    })

})

app.get('/admin/orders/', (req, res) => {
    if (req.ip != '::1') {
        res.status(401).json({
            message: "your not allowed to acess"
        })
        return
    }
    res.sendFile(path.join(__dirname + '/../public/orders.html'))
})

app.get('/admin/stocks/', (req, res) => {
    if (req.ip != '::1') {
        res.status(401).json({
            message: "your not allowed to acess"
        })
        return
    }
    res.sendFile(path.join(__dirname + '/../public/stocks.html'))
})

export default app