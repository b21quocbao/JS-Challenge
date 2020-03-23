import app from "./server";
import { MongoClient } from "mongodb"

const port = process.env.PORT || 3000

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
			res.redirect("/home")
        })

        app.post("/registerComplete", (req, res) => {
            db.collection("Users").findOne({email: req.body.email}, (err, res) => {
                if (res === null) { 
                    console.log(1);
                    db.collection("Users").insertOne(
                        { "email": req.body.email, "password": req.body.password }
                    )
                } else {
                    console.log(0);
                }
            })
            res.redirect("/")
        })
        
		app.get("/:link", (req, res) => {
            res.render(req.params.link)
        })

		app.listen(port, () => {
			console.log(`listening on port ${port}`)
		})
	})
