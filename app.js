let cryptr = require("cryptr");
let express = require("express");
let bodyParser = require("body-parser");
// let mongoose = require("mongoose");
let _ = require("lodash");

let app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
// mongoose.connect("mongodb+srv://admin:nguyendu@cluster0-xj9qm.mongodb.net/JS-challenge-DB", { useUnifiedTopology: true , useNewUrlParser: true });
// mongoose.set('useFindAndModify', false);

async function init() {
    console.log(1);
    await sleep(1000);
    console.log(2);
  }
  
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }   

app.post("/complete", (req, res) => {
    console.log(req.body.name);
    console.log(req.body.password);
    res.redirect(200, '/index');
});

app.get("/", (req, res) => {
    res.redirect('/index');
})

app.get("/:link", (req, res) => {
    res.render(req.params.link);
});




let port = 3000;
if (port == null || port == "") {
    port = 3000;
}

app.listen(3000);
