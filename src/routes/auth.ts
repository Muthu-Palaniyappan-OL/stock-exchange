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

app.get('/api/v1/auth', (req, res) => {
    if (req.body.dpid === undefined || req.body.password === undefined) {
        res.status(400).json({
            message: "Dpid And Password is missing"
        })
        return
    }
    pool.query(`SELECT dp_pswd_check('${req.body.dpid}', '${req.body.password}')`, (error, results) => {
        if (error) {
            throw error
        }

        if (results.rows[0].dp_pswd_check == false) {
            res.status(400).json({
                message: "wrong dp id or password"
            })
            return
        } else {
            let token = jwt.sign({
                id: req.body.dpid
            }, 'privatekey')
            res.send(token)
        }
    })
})

export default app