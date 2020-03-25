import app from "./server";
import { MongoClient } from "mongodb"

const port = process.env.PORT || 3000
let login = 0
let ejs = require("ejs")
let curEmail = ""

MongoClient.connect(process.env.MFLIX_DB_URI, {
	wtimeout: 2500,
	useNewUrlParser: true
})
	.catch(err => {
		console.error(err.stack)
		process.exit(1)
	})
	.then(async client => {
        let db = client.db("Web")

		app.get("/", (req, res) => {
			res.redirect("/index")
        })

        app.get("/logout", (req, res) => {
            login = 0
            db.collection("Users").updateOne({ "email": curEmail }, { $set: {"active": 0} })
            res.redirect("/index")
        })

        app.post("/registerComplete", (req, res) => {
            db.collection("Users").findOne({email: req.body.email}, (err, result) => {
                if (result === null) { 
                    db.collection("Users").insertOne(
                        { "email": req.body.email, "password": req.body.password, "name": req.body.name }
                    )
                    login = 1
                    db.collection("Users").updateOne({ "email": req.body.email }, { $set: {"active": 1} })
                    curEmail = req.body.email
                    res.redirect("/InfoUpdate")
                } else {
                    res.render("registration", { login: login, loginFail: 0, registerFail: 1 })
                }
            })
        })

        app.post("/loginProcess", (req, res) => {
            db.collection("Users").findOne({email: req.body.email}, (err, result) => {
                if (result == null || result.password != req.body.password) {
                    res.render("login", { login: login, loginFail: 1, registerFail: 0 })
                } else {
                    login = 1
                    db.collection("Users").updateOne({ "email": req.body.email }, { $set: {"active": 1} } )
                    curEmail = req.body.email
                    res.redirect("/user")
                }
            })
        })
        
		app.get("/:link", (req, res) => {
            res.render(req.params.link, { login: login, loginFail: 0, registerFail: 0 })
        })

		app.listen(port, () => {
			console.log(`listening on port ${port}`)
		})
	})
