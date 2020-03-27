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

        //--------------------ONLY ADMIN----------------------------
        
        app.post("/addedpost", (req, res) => {
            if (req.cookies.admin == 1) {
                console.log(req.body.html);
                if (!req.body.html)
                req.body.post = '<p>' + req.body.post.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + '</p>';
                req.body.date = new Date()
                req.body.date = req.body.date.toDateString()
                req.body.createdBy = req.cookies.username
                db.collection("post").insertOne(req.body)
                res.redirect("post-list")
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.post("/addedTraining", (req, res) => {
            if (req.cookies.admin == 1) {
                req.body.requirement = '<ul><li>' + req.body.requirement1.replace("\n", "</li><li>") + '</li></ul>';
                db.collection("training").insertOne(req.body)
                res.redirect("training")
            } else {
                res.redirect("/unauthorize")
            }
        })
        
        app.post("/training/delete/:_id", (req, res) => {
            if (req.cookies.admin == 1) {
                db.collection("training").deleteOne({ _id: ObjectId(req.params._id) })
                res.redirect("/training")
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.get("/training/edit/:_id", (req, res) => {
            if (req.cookies.admin == 1) {
                db.collection("Users").find({}).toArray((err, result) => {
                    db.collection("training").findOne({ "_id": ObjectId(req.params._id) }, (err, result1) => {
                        res.render("editTraining", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 0, status: result, val: result1 })
                    })
                })
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.post("/training/update/:_id", (req, res) => {
            if (req.cookies.admin == 1) {
                req.body.requirement = '<ul><li>' + req.body.requirement1.replace("\n", "</li><li>") + '</li></ul>';
                db.collection("training").updateOne(
                    { "_id": ObjectId (req.params._id) },
                    { $set: req.body }
                )
                res.redirect("/training")
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.post("/post/delete/:_id", (req, res) => {
            if (req.cookies.admin == 1) {
                db.collection("post").deleteOne({ _id: ObjectId(req.params._id) })
                res.redirect("/post-list")
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.get("/post/edit/:_id", (req, res) => {
            if (req.cookies.admin == 1) {
                db.collection("Users").find({}).toArray((err, result) => {
                    db.collection("post").findOne({ "_id": ObjectId(req.params._id) }, (err, result1) => {
                        res.render("editPost", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 0, status: result, val: result1 })
                    })
                })
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.post("/post/update/:_id", (req, res) => {
            if (req.cookies.admin == 1) {
                db.collection("post").updateOne(
                    { "_id": ObjectId (req.params._id) },
                    { $set: req.body }
                )
                res.redirect("/post-list")
            } else {
                res.redirect("/unauthorize")
            }
        })
        
        //--------------------ONLY USER-----------------------------
        app.post("/addedConfession", (req, res) => {
            if (req.cookies.login == 1) {
                db.collection("confession").insert(req.body)
                res.redirect("/confession")
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.get("/confession", (req, res) => {
            if (req.cookies.login == 1) {
                db.collection("Users").find({}).toArray((err, result) => {
                    db.collection("confession").find({}).toArray((err, result1) => {
                        res.render("confession", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 0, status: result, confession: result1 })
                    })
                })
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.post("/addComment", (req, res) => {
            db.collection("Users").findOne({ username: req.cookies.username }, (err, result) => {
                db.collection("post").updateOne(
                    { "_id": ObjectId(req.body.postId) },
                    { $push: { comments: { avatarFile: result.avatarFile ,username: req.cookies.username, text: req.body.text, date: new Date() } } }
                )
            })
            res.redirect("/post/" + req.body.postId)
        })
        app.post("/addComment1", (req, res) => {
            db.collection("Users").findOne({ username: req.cookies.username }, (err, result) => {
                db.collection("confession").updateOne(
                    { "_id": ObjectId(req.body.cfsId) },
                    { $push: { "comments": { avatarFile: result.avatarFile ,username: req.cookies.username, text: req.body.text, date: new Date() } } }
                )
            })
            res.redirect("/confession")
        })
        app.get("/user/:username", (req, res) => {
            if (req.cookies.login == 1) {
                db.collection("Users").findOne({ "username": req.params.username }, (err, result) => {
                    db.collection("Users").find({}).toArray((err, result1) => {
                        res.render("user", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 0, update: (req.params.username == req.cookies.username), profile: result, status: result1 })
                    })
                })
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.post("/training/register/:_id", (req, res) => {
            db.collection("Users").updateOne(
                { "username": req.cookies.username },
                { $push: { "training": req.params._id } }
            )
            res.redirect("/training")
        })

        app.get("/profile", (req, res) => {
            if (req.cookies.login == 1) {
                res.redirect("/user" + "/" + req.cookies.username)
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.post("/InfoUpdated", (req, res) => {
            if (req.cookies.login == 1) {
                for (let i of Object.keys(req.body))
                if (req.body[i])
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { [i]: req.body[i] } })
                res.redirect("/profile")
            } else {
                res.redirect("/unauthorize")
            }
        })

        app.get("/logout", (req, res) => {
            if (req.cookies.login == 1) {
                res.cookie("login", 0)
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { "socket": [] } })
                res.redirect("/index")
            } else {
                res.redirect("/unauthorize")
            }
        })


        //--------------------PUBLIC-------------------------------

        app.get("/", (req, res) => {
			res.redirect("/index")
        })

        app.post("/registerComplete", (req, res) => {
            db.collection("Users").findOne({ $or: [ { "email": req.body.email }, { "username": req.body.username } ] }, (err, result) => {
                if (result === null) { 
                    req.body.avatarFile = "assets/img/avatars/" + req.body.sex + ".jpg"
                    req.body.admin = 0
                    db.collection("Users").insertOne(req.body)
                    res.cookie("login", 1)
                    res.cookie("admin", 0)
                    res.cookie("email", req.body.email)
                    res.cookie("username", req.body.username)
                    res.cookie("password", req.body.password)
                    res.redirect("/InfoUpdate")
                } else {
                    db.collection("Users").find({}).toArray((err, result1) => {
                        res.render("registration", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 1, status: result1 })
                    })
                }
            })
        })

        app.post("/loginProcess", (req, res) => {
            db.collection("Users").findOne({email: req.body.email}, (err, result) => {
                if (result == null || result.password != req.body.password) {
                    db.collection("Users").find({}).toArray((err, result1) => {
                        res.render("login", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 1, registerFail: 0, status: result1 })
                    })
                } else {
                    res.cookie("login", 1)
                    res.cookie("email", req.body.email)
                    res.cookie("username", result.username)
                    res.cookie("admin", result.admin)
                    res.cookie("password", req.body.password)
                    res.redirect("/profile")
                }
            })
        })

        app.get("/training", (req, res) => {
            db.collection("training").find({}).toArray((err, result) => {
                db.collection("Users").find({}).toArray((err, result1) => {
                    db.collection("Users").findOne({ "username": req.cookies.username }, (err, result2) => {
                        res.render("training", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 0, trainings: result, status: result1, profile: result2})
                    })
                })
            })
        })

        app.get("/post-list", (req, res) => {
            db.collection("post").find({}).sort({ _id: -1 }).toArray((err, result) => {
                db.collection("Users").find({}).toArray((err, result1) => {
                    res.render("post-list", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 0, posts: result, status: result1 })
                })
            })
        })

        app.get("/post/:_id", (req, res) => {
            db.collection("post").findOne({ "_id": ObjectId(req.params._id) }, (err, result) => {
                db.collection("Users").find({}).toArray((err, result1) => {
                    res.render("post", { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 0, i: result, status: result1 })
                })
            })
        })
        
		app.get("/:link", (req, res) => {
            if (restrictSite.includes(req.params.link) && req.cookies.login != 1) {
                res.redirect("/")
            } else {
                db.collection("Users").find({}).toArray((err, result) => {
                    res.render(req.params.link, { login: req.cookies.login, admin: req.cookies.admin,  loginFail: 0, registerFail: 0, status: result })
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
