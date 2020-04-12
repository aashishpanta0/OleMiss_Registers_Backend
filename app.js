const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
var jwt= require('jwt-simple');

// Create connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'database_final'
});

// Connect
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('MySql Connected...');
});

const app = express();
app.use(cors())
app.use(express.json());
var secret='yebhai'

let token=''
let decoded=''

// Insert admin
app.post('/admin/create', (req, res) => {
    const userType = req.body.userType
    console.log("Log1")
    if (userType === "Department") {
        let sql = `SELECT * FROM superadmin WHERE super_admin="${req.body.email}"`
        console.log("Log2")
        db.query(sql, (err, result) => {
            if (err) {
                console.log("Log3")
                console.log(err)
                return res.status(500).send({ error: "Server Error" })
            }
            console.log("Log4")
            if (result.length === 0) {
                console.log(req.body.email)
                console.log(result)
                console.log("Log5")
                return res.status(400).send({ error: "You are not authorized to create this account." })
            }
            let sql = `SELECT * from admin WHERE email=  '${req.body.email}'`
            db.query(sql, (error, result) => {
                console.log("Log6")
                if (result.length !== 0) {
                    
                    return res.status(200).send("User exists")
                }
                let post = { olemissid: req.body.olemissid, Name: req.body.name, email: req.body.email, password: req.body.password };
                let sql = 'INSERT INTO admin SET ?';
                query = db.query(sql, post, (err, result) => {
                    if (err) {
                        console.log("Log8")
                        return res.status(500).send({ error: "Server Error" })
                    }
                    console.log("Log9")
                    res.status(200).send("Admin Created")
                })
            })


        });
    }
    if(userType==="Teacher"){
        let sql =`SELECT * FROM teacher WHERE olemissid="${req.body.olemissid}"`
        console.log(req.body)
        db.query(sql, (err, result)=>{
            
            if(err) {
               
            console.log('teacher ma xirena');
            return res.status(500).send({ error: "Server Error" })
            }

        if(result.length!==0){
            return res.status('200').send('user exists')
        }
        if(result.length===0){
            let post = { olemissid: req.body.olemissid, name: req.body.name, email: req.body.email, password: req.body.password };
                let sql = 'INSERT INTO teacher SET ?';
                db.query(sql, post, (err, result)=>{
                    if(err){
                        console.log('insert vayena')
                        return res.status('400').send('insert vayena')
                    }
                    console.log(' created')
                    res.status('200').send('teacher Created');
                })

        }
        
        })
    }


    if(userType==="Student"){
        let sql =`SELECT * FROM students WHERE studentid="${req.body.olemissid}"`
        console.log(req.body)
        db.query(sql, (err, result)=>{
            
            if(err) {
               
            console.log('student ma xirena');
            return res.status(500).send({ error: "Server Error" })
            }

        if(result.length!==0){
            return res.status('200').send('user exists')
        }
        if(result.length===0){
            let post = { studentid: req.body.olemissid, student_name: req.body.name, email: req.body.email, password: req.body.password };
                let sql = 'INSERT INTO students SET ?';
                db.query(sql, post, (err, result)=>{
                    if(err){
                        console.log('insert vayena')
                        return res.status('400').send('insert vayena')
                    }
                    console.log('student created')
                    res.status('200').send('Student Created');
                })

        }
        
        })
    }


});

app.post('/admin/login', (req, res) => {
    console.log('log1')
    const userType = req.body.user;
    if (userType === 'Department') {
        console.log('log2')
        let sql = `SELECT * FROM admin WHERE email="${req.body.email}"`;
       
        db.query(sql, (err, result) => {
            if(err){
                console.log('log3')
            console.log(err)
                return res.status(500).send({ error: "Server Error" })
            }
            if(result.length===0){
                console.log('log4')
                return res.status(400).send({ error: "USER NOT FOUND" })
           
            }
            console.log(result[0].password)
            console.log(req.body.password)
            if (result.length !== 0 && req.body.password===result[0].password) {
                console.log('log5')
                
                    console.log('log6')
                    console.log('valid credentials')
                    return res.status('200').send(result)
                
            }

        }

        )}

        if(userType==='Student'){
            console.log('log1');
            let sql= `SELECT * FROM students WHERE email='${req.body.email}'`
           console.log('log2')
            db.query(sql,(err, result)=>{ 
                if(err){
                console.log('log3');
                return res.status('500').send('database error');
    
            }
            if(result.length===0){
                console.log('log4');
                return res.send('400').send('user not found');
                
            }
        
            if(result.length!==0 && req.body.password===result[0].password){
                token=jwt.encode(result[0].email, secret);
                 decoded=jwt.decode(token, secret);
                
                console.log(result[0].studentid)
                console.log('log5: student login successful');
                 console.log(result[0].email)
                return res.status('200').send(token);
            }
            })
        }
        if(userType==='Teacher'){
            console.log('log1');
            let sql= `SELECT * FROM teacher WHERE email='${req.body.email}'`
           console.log('log2')
            db.query(sql,(err, result)=>{ 
                if(err){
                console.log('log3');
                return res.status('500').send('database error');
    
            }
            if(result.length===0){
                console.log('log4');
                return res.send('400').send('user not found');
                
            }
           
            if(result.length!==0 && req.body.password===result[0].password){
                console.log('log5: teacher login successful');
                return res.status('200').send(result);
            }
            })
        }
});

app.post('/verifyuser', (req, res)=>{
    decoded=jwt.decode(req.body.token, secret);
    let email = decoded;
    const  isValid=true;
    let sql = `SELECT * FROM students WHERE email='${email}'`
    db.query(sql, (err, result)=>{
        if(err){
            return res.status('500').send('error')
        }
        if(result.length===0){
            return res.status('400').send('user not found')
        }
        if(result.length!==0){
            console.log(isValid)
            return res.status('200').send(isValid)
        }
    })


})




// Select posts
app.get('/admin/retrieveadmin/:olemissid', (req, res) => {
    let sql = `SELECT * FROM admin WHERE olemissid= '${req.params.olemissid}'`;
    let query = db.query(sql, (err, results) => {
        if (err) throw err;
        console.log(results);
        res.send(result);
    });
});

// Select single post
app.get('/admin/retrieveall', (req, res) => {
    let sql = `SELECT * FROM admin`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('all admin data fetched...');
    });
});

// // Update post
// app.get('/updateadmin/:olemissid', (req, res) => {
//     let newTitle = 'Updated Title';
//     let sql = `UPDATE posts SET title = '${newTitle}' WHERE olemissid = ${req.params.olemissid}`;
//     let query = db.query(sql, (err, result) => {
//         if(err) throw err;
//         console.log(result);
//         res.send('Post updated...');
//     });
// });

// Delete post
app.get('/admin/deleteadmin/:olemissid', (req, res) => {
    let newTitle = 'Updated Title';
    let sql = `DELETE FROM admin WHERE olemissid = ${req.params.olemissid}`;
    let query = db.query(sql, (err, result) => {
        if (err) throw err;
        console.log(result);
        res.send('admin deleted...');
    });
});

app.listen('5000', () => {
    console.log('Server started on port 5000');
});