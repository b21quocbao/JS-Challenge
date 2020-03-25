import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
// import cors from "cors"
// import morgan from "morgan"

const app = express()

// app.use(cors())
app.set("view engine", "ejs")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use(cookieParser())

export default app
