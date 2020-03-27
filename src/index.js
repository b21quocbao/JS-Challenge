import app from "./server";
import cookie from "cookie"
import { MongoClient } from "mongodb"
import cookieParser from "cookie-parser";

const port = process.env.PORT || 3000
let ejs = require("ejs")
var ObjectId = require('mongodb').ObjectID;
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const restrictSite = ["user", "addTraining", "InfoUpdate", "logout"]

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

        //--------------------PRIVATE-------------------------------
        
        app.get("/user/:username", (req, res) => {
            if (req.cookies.login == 1) {
                db.collection("Users").findOne({ "username": req.params.username }, (err, result) => {
                    db.collection("Users").find({}).toArray((err, result1) => {
                        res.render("user", { login: req.cookies.login, loginFail: 0, registerFail: 0, update: (req.params.username == req.cookies.username), profile: result, status: result1 })
                    })
                })
            } else {
                res.redirect("/")
            }
        })

        app.post("/addedpost", (req, res) => {
            if (req.cookies.login == 1) {
                console.log(req.body.html);
                if (!req.body.html)
                req.body.post = '<p>' + req.body.post.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + '</p>';
                req.body.date = new Date()
                req.body.date = req.body.date.toDateString()
                req.body.createdBy = req.cookies.username
                db.collection("post").insertOne(req.body)
                res.redirect("post-list")
            } else {
                res.redirect("/")
            }
        })

        app.get("/profile", (req, res) => {
            if (req.cookies.login == 1) {
                res.redirect("/user" + "/" + req.cookies.username)
            } else {
                res.redirect("/")
            }
        })

        app.post("/InfoUpdated", (req, res) => {
            if (req.cookies.login == 1) {
                for (let i of Object.keys(req.body))
                if (req.body[i])
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { [i]: req.body[i] } })
                res.redirect("/profile")
            } else {
                res.redirect("/")
            }
        })

        app.get("/logout", (req, res) => {
            if (req.cookies.login == 1) {
                res.cookie("login", 0)
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { "socket": [] } })
                res.redirect("/index")
            } else {
                res.redirect("/")
            }
        })

        app.post("/addedTraining", (req, res) => {
            if (req.cookies.login == 1) {
                db.collection("training").insertOne(req.body)
                res.redirect("training")
            } else {
                res.redirect("/")
            }
        })

        //--------------------PUBLIC-------------------------------

        app.get("/", (req, res) => {
			res.redirect("/index")
        })

        app.post("/registerComplete", (req, res) => {
            db.collection("Users").findOne({ $or: [ { "email": req.body.email }, { "username": req.body.username } ] }, (err, result) => {
                if (result === null) { 
                    db.collection("Users").insertOne(req.body)
                    res.cookie("login", 1)
                    res.cookie("email", req.body.email)
                    res.cookie("username", req.body.username)
                    res.cookie("password", req.body.password)
                    res.redirect("/InfoUpdate")
                } else {
                    db.collection("Users").find({}).toArray((err, result1) => {
                        res.render("registration", { login: req.cookies.login, loginFail: 0, registerFail: 1, status: result1 })
                    })
                }
            })
        })

        app.post("/loginProcess", (req, res) => {
            db.collection("Users").findOne({email: req.body.email}, (err, result) => {
                if (result == null || result.password != req.body.password) {
                    db.collection("Users").find({}).toArray((err, result1) => {
                        res.render("login", { login: req.cookies.login, loginFail: 1, registerFail: 0, status: result1 })
                    })
                } else {
                    res.cookie("login", 1)
                    res.cookie("email", req.body.email)
                    res.cookie("username", result.username)
                    res.cookie("password", req.body.password)
                    res.redirect("/profile")
                }
            })
        })

        app.get("/training", (req, res) => {
            db.collection("training").find({}).toArray((err, result) => {
                db.collection("Users").find({}).toArray((err, result1) => {
                    res.render("training", { login: req.cookies.login, loginFail: 0, registerFail: 0, trainings: result, status: result1 })
                })
            })
        })

        app.get("/post-list", (req, res) => {
            db.collection("post").find({}).toArray((err, result) => {
                db.collection("Users").find({}).toArray((err, result1) => {
                    res.render("post-list", { login: req.cookies.login, loginFail: 0, registerFail: 0, posts: result, status: result1 })
                })
            })
        })

        app.get("/post/:_id", (req, res) => {
            db.collection("post").findOne({ "_id": ObjectId(req.params._id) }, (err, result) => {
                db.collection("Users").find({}).toArray((err, result1) => {
                    res.render("post", { login: req.cookies.login, loginFail: 0, registerFail: 0, i: result, status: result1 })
                })
            })
        })
        
		app.get("/:link", (req, res) => {
            if (restrictSite.includes(req.params.link) && req.cookies.login != 1) {
                res.redirect("/")
            } else {
                db.collection("Users").find({}).toArray((err, result) => {
                    res.render(req.params.link, { login: req.cookies.login, loginFail: 0, registerFail: 0, status: result })
                })
            }
        })

        io.on('connection', function(socket) {
            if (socket.handshake.headers.cookie) {
                var cookies = cookie.parse(socket.handshake.headers.cookie);
                if (cookies.login == 1) {
                    db.collection("Users").updateOne({ "email": cookies.email }, { $push: { "socket": socket.id } })
                }
                socket.on('disconnect', function(){
                    if (cookies.login) {
                        db.collection("Users").updateOne({ "email": cookies.email }, { $pull: { "socket": socket.id } })
                    }
                })
            }
        });

		http.listen(port, () => {
			console.log(`listening on port ${port}`)
		})
	})
