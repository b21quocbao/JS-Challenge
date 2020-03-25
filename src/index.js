import app from "./server";
import cookie from "cookie"
import { MongoClient } from "mongodb"
import cookieParser from "cookie-parser";

const port = process.env.PORT || 3000
let ejs = require("ejs")
var http = require('http').createServer(app);
var io = require('socket.io')(http);

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

        app.get("/user", (req, res) => {
            db.collection("Users").findOne({ "email": req.cookies.email }, (err, result) => {
                res.render("user", { login: req.cookies.login, loginFail: 0, registerFail: 0, profile: result })
            })
        })

        app.post("/InfoUpdated", (req, res) => {
            // console.log(req.body.avatar-file);
            if (req.body.name) {
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { "name": req.body.name } })
            }
            if (req.body.phone) {
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { "phone": req.body.phone } })
            }
            if (req.body.schoolEmail) {
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { "schoolEmail": req.body.schoolEmail } })
            }
            if (req.body.dob) {
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { "dob": req.body.dob } })
            }
            if (req.body.home) {
                db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { "home": req.body.home } })
            }
            console.log(req.body);
            res.redirect("/user")
        })

        app.get("/members", (req, res) => {
            db.collection("Users").find({}).toArray((err, result) => {
                for (let i = 0; i < result.length; ++ i)
                console.log(result[i].email, " ", (result[i].socket == undefined ? 0 : result[i].socket.length));
            });
            res.redirect("/")
        })

        app.get("/logout", (req, res) => {
            res.cookie("login", 0)
            db.collection("Users").updateOne({ "email": req.cookies.email }, { $set: { "socket": [] } })
            res.redirect("/index")
        })

        app.post("/registerComplete", (req, res) => {
            db.collection("Users").findOne({email: req.body.email}, (err, result) => {
                if (result === null) { 
                    db.collection("Users").insertOne(
                        { "email": req.body.email, "password": req.body.password, "name": req.body.name }
                    )
                    res.cookie("login", 1)
                    res.cookie("email", req.body.email)
                    res.cookie("password", req.body.password)
                    res.redirect("/InfoUpdate")
                } else {
                    res.render("registration", { login: req.cookies.login, loginFail: 0, registerFail: 1 })
                }
            })
        })

        app.post("/loginProcess", (req, res) => {
            db.collection("Users").findOne({email: req.body.email}, (err, result) => {
                if (result == null || result.password != req.body.password) {
                    res.render("login", { login: req.cookies.login, loginFail: 1, registerFail: 0 })
                } else {
                    res.cookie("login", 1)
                    res.cookie("email", req.body.email)
                    res.cookie("password", req.body.password)
                    res.redirect("/user")
                }
            })
        })
        
		app.get("/:link", (req, res) => {
            res.render(req.params.link, { login: req.cookies.login, loginFail: 0, registerFail: 0 })
        })

        io.on('connection', function(socket) {
            if (socket.handshake.headers.cookie) {
                var cookies = cookie.parse(socket.handshake.headers.cookie);
                if (cookies.login) {
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
