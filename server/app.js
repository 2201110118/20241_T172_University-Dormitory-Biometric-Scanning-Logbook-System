import express from 'express'
import dotenv from 'dotenv'

const app = express()
dotenv.config()

// routes
import studentRoute from './routes/accountRoute.js'

//api
app.use('/api/account', studentRoute)

const PORT = process.env.PORT


app.listen(PORT, () => {
    console.log(`server is listening on port ${PORT}...`)
})