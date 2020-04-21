import express from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import posts from "../src/api/posts.route"
import users from "../src/api/users.route"
import trainings from "../src/api/trainings.route"
import confessions from "../src/api/confessions.route"
import others from "../src/api/others.route"
import morgan from "morgan"
import cors from "cors"

const app = express()

app.use(cors())
app.use(morgan("dev",  {
    skip: function (req, res) { 
        return req.url.includes("assets") 
    }
  }))
app.set("view engine", "ejs")
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cookieParser())

// Register api routes
app.use("/posts", posts)
app.use("/users", users)
app.use("/trainings", trainings)
app.use("/confessions", confessions)
app.use("/", others)

// Register static folders
app.use('/user', express.static('public'))
app.use('/post', express.static('public'))
app.use('/training/edit', express.static('public'))
app.use('/post/edit', express.static('public'))
///////////////////////////////////////
app.use('/', express.static('public'))
app.use('/posts/id', express.static('public'))
app.use('/posts', express.static('public'))
app.use('/posts/edit', express.static('public'))
app.use('/users', express.static('public'))
app.use('/trainings', express.static('public'))
app.use('/trainings/edit', express.static('public'))
app.use('/posts/add', express.static('public'))
app.use('/confessions', express.static('public'))

// app.use("*", (req, res) => res.status(404).json({ error: "not found" }))


export default app
