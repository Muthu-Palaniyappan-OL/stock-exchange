import express from "express";
import auth from './routes/auth'
import getstocks from './routes/getstocks'
import placeorder from './routes/placeorder'
import updateorders from './routes/updateorders'
import deleteorders from './routes/deleteorders'
import admin from './routes/admin'

const port = process.env.PORT === undefined ? 8080 : parseInt(process.env.PORT)
const app = express()
app.use(auth)
app.use(getstocks)
app.use(placeorder)
app.use(updateorders)
app.use(deleteorders)
app.use(admin)
app.use('/admin/orders/', express.static('public'))

app.listen(port)