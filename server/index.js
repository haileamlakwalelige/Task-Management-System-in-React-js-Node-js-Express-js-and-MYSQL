const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");



const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

const con = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"userstasks",
    port:"3307",
});

app.get("/createdb",(req, res)=>{
    const sql ="CREATE DATABASE userstasks";
    con.query(sql, (err, result)=>{
        if(err){
            throw err;
        }
        res.send("Database Created successfully, so enjoy it !");
    });
});

app.get("/table",(req, res)=>{
    const createTableSQL = `
    CREATE TABLE users (
        id INT NOT NULL AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
    );
`;

con.query(createTableSQL, (error, results, fields) => {
  if (error) throw error;
  res.send("Table created successfully!")
});
});

app.get("/table3",(req, res)=>{
    const createTableSQL = `
    CREATE TABLE empTasks (
        id INT NOT NULL AUTO_INCREMENT,
        task VARCHAR(255) NOT NULL,
        description VARCHAR(255) NOT NULL,
        complete VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
    );
`;

con.query(createTableSQL, (error, results, fields) => {
  if (error) throw error;
  res.send("Table  2 created successfully!")
});
});


app.post("/register",(req, res)=>{
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    con.query("INSERT INTO users (name, email, password) VALUES (?, ?,?)", [name, email, password], (err, result)=>{
        if(err){
            res.send({err:err})
        }
        return res.json("Success");
    });
});

const verifyJwt =(req, res, next)=>{
    const token = req.headers['access-token'];
    if(!token){
        return res.json("We need token please provide it fot next time");
    }else{
    jwt.verify(token, "jwt-secrete-key", (err, decoded)=>{
        if(err){
            res.json("Not Authenticated");
        }else{
            req.userId = decoded.id;
            next();
        }
    })
}}


app.get("/checkAuth", verifyJwt, (req, res)=>{
    return res.json("Authenticated");
})






app.post("/login",(req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    con.query("SELECT * FROM users WHERE email=? AND password = ?", [ email, password], (err, data)=>{
        if(err){
            res.send({err:err})
        }else{
            if(data.length > 0){
                const id = data[0].id;
               const token =   jwt.sign({id}, "jwt-secrete-key", {expiresIn:300})
                return res.json({Login:true, token, data});
            }else{
                res.send({message: "Wrong Name/Password Combination"})
            }
        }
    });
});

app.get('/read', (req, res)=>{
    const sql = 'SELECT * FROM empTasks';
    con.query(sql, (err, result)=>{
        if(err){
            return res.json({message:"Error inside server"});
        }
        return res.json(result);
    });
});

app.get('/complete', (req, res)=>{
    const sql = "SELECT * FROM empTasks WHERE complete='yes'";
    con.query(sql, (err, result)=>{
        if(err){
            return res.json({message:"Error inside server"});
        }
        return res.json(result);
    });
});

app.get('/incomplete', (req, res)=>{
    const sql = "SELECT * FROM empTasks WHERE complete='no'";
    con.query(sql, (err, result)=>{
        if(err){
            return res.json({message:"Error inside server"});
        }
        return res.json(result);
    });
});

app.get('/read/:id', (req, res)=>{
    const sql = ' SELECT * FROM empTasks WHERE id = ?';
    const id = req.params.id;
    con.query(sql,[id] , (err, result)=>{
        if(err){
            return res.json({message:"Error inside server"});
        }
        return res.json(result);
    });
});

app.put('/edit/:id', (req, res)=>{
    let sql =
      "UPDATE empTasks SET task='" +
      req.body.task +
      "', description='" +
      req.body.description +
      "',complete='" +
      req.body.complete +
      "'  WHERE id=" +
      req.params.id;
    const id = req.params.id;
    con.query(sql, (err, result)=>{
        if(err){
            return res.json({message:"Error inside server"});
        }
        return res.json(result);
    });
});

app.delete('/delete/:id', function(req, res) {

    let id = req.params.id;
   
    let sql = `DELETE FROM empTasks WHERE id = ${id}`;
   
    con.query(sql, (err, result) => {
     if (!err) {
       res.send(result);
     } else {
       console.log(err);
       res.status(500).send('An error occurred.');
     }
    });
   })



    app.post("/create1", (req, res)=>{
        let detail ={
          task : req.body.task,
         description : req.body.description,
         complete : req.body.complete,
        }
        const sql = "INSERT INTO empTasks SET ?";
        con.query(sql, detail, (err, result)=>{
            if(err) return res.json(result);
            return res.json(result);
        });
    });
app.listen(3001, ()=>{
    console.log("App is Running in port 3001 !");
});
