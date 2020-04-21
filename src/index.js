import app from "./server";
import cookie from "cookie"
import { MongoClient } from "mongodb"
import PostsDAO from "./dao/postsDAO"
import UsersDAO from "./dao/usersDAO"
import TrainingsDAO from "./dao/trainingsDAO"
import CommentsDAO from "./dao/commentsDAO"
import CfsDAO from "./dao/confessionsDAO"
import PreRegistersDAO from "./dao/preRegistersDAO"
import { User } from "./api/users.controller";

const port = process.env.PORT || 3000
let ejs = require("ejs")
var ObjectId = require('mongodb').ObjectID;
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const restrictSite = ["user", "addTraining", "InfoUpdate", "logout"]

MongoClient.connect(process.env.DB_URI, {
	wtimeout: 2500,
	useNewUrlParser: true
})
	.catch(err => {
		console.error(err.stack)
		process.exit(1)
	})
	.then(async client => {
        let db = client.db("Web")
        await PostsDAO.injectDB(client)
        await UsersDAO.injectDB(client)
        await CfsDAO.injectDB(client)
        await TrainingsDAO.injectDB(client)
        await CommentsDAO.injectDB(client)
        await PreRegistersDAO.injectDB(client)

        io.on('connection', async socket => {
            socket.on('login', async function() {
                
                var cookies = cookie.parse(socket.handshake.headers.cookie);
                let { username, error } = await User.decoded(cookies.token)

                if (!error) {
                    await UsersDAO.addSocket(username, socket.id)
                }
            })
            socket.on('disconnect', async function() {
                
                var cookies = cookie.parse(socket.handshake.headers.cookie);
                let { username, error } = await User.decoded(cookies.token)

                if (!error) {
                    await UsersDAO.removeSocket(username)
                }
            })
        });

		http.listen(port, () => {
			console.log(`listening on port ${port}`)
		})
	})
