const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
var jwt = require('jwt-simple');

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
var secret = 'yebhai'

let token = ''
let decoded = ''

// Insert admin
app.post('/admin/create', (req, res) => {
    const userType = req.body.userType

    if (userType === "Department") {
        let sql = `SELECT * FROM superadmin WHERE super_admin="${req.body.email}"`

        db.query(sql, (err, result) => {
            if (err) {

                console.log(err)
                return res.status(500).send({ error: "Server Error" })
            }

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
    if (userType === "Teacher") {
        let sql = `SELECT * FROM teacher WHERE olemissid="${req.body.olemissid}"`
        console.log(req.body)
        db.query(sql, (err, result) => {

            if (err) {

                console.log('teacher ma xirena');
                return res.status(500).send({ error: "Server Error" })
            }

            if (result.length !== 0) {
                return res.status('200').send('user exists')
            }
            if (result.length === 0) {
                let post = { olemissid: req.body.olemissid, name: req.body.name, email: req.body.email, password: req.body.password };
                let sql = 'INSERT INTO teacher SET ?';
                db.query(sql, post, (err, result) => {
                    if (err) {
                        console.log('insert vayena')
                        return res.status('400').send('insert vayena')
                    }
                    console.log(' created')
                    res.status('200').send('teacher Created');
                })

            }

        })
    }


    if (userType === "Student") {
        let sql = `SELECT * FROM students WHERE studentid="${req.body.olemissid}"`

        db.query(sql, (err, result) => {

            if (err) {

                console.log('student ma xirena');
                return res.status(500).send({ error: "Server Error" })
            }

            if (result.length !== 0) {
                return res.status('200').send('user exists')
            }
            if (result.length === 0) {
                let post = { studentid: req.body.olemissid, student_name: req.body.name, email: req.body.email, password: req.body.password };
                let sql = 'INSERT INTO students SET ?';
                db.query(sql, post, (err, result) => {
                    if (err) {
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
            if (err) {
                console.log('log3')
                console.log(err)
                return res.status(500).send({ error: "Server Error" })
            }
            if (result.length === 0) {
                console.log('log4')
                return res.status(400).send({ error: "USER NOT FOUND" })

            }

            if (result.length !== 0 && req.body.password === result[0].password) {
                token = jwt.encode(result[0].email, secret);
                decoded = jwt.decode(token, secret);
                console.log('log5')

                console.log('log6')
                console.log('valid credentials')
                return res.status('200').send({ token, user: userType })

            }

        }

        )
    }

    if (userType === 'Student') {
        console.log('log1');
        let sql = `SELECT * FROM students WHERE email='${req.body.email}'`

        db.query(sql, (err, result) => {
            if (err) {
                console.log('log3');
                return res.status('500').send('database error');

            }
            if (result.length === 0) {

                return res.send('400').send('user not found');

            }

            if (result.length !== 0 && req.body.password === result[0].password) {
                token = jwt.encode(result[0].email, secret);
                decoded = jwt.decode(token, secret);


                console.log('log5: student login successful');
                console.log(result[0].email)
                console.log(userType)
                return res.status('200').send({ token, user: userType });
            }
        })
    }
    if (userType === 'Teacher') {
        console.log('log1');
        let sql = `SELECT * FROM teacher WHERE email='${req.body.email}'`
        console.log('log2')
        db.query(sql, (err, result) => {
            if (err) {
                console.log('log3');
                return res.status('500').send('database error');

            }
            if (result.length === 0) {
                console.log('log4');
                return res.send('400').send('user not found');

            }

            if (result.length !== 0 && req.body.password === result[0].password) {
                console.log('log5: teacher login successful');
                return res.status('200').send(result);
            }
        })
    }
});

app.post('/verifyuser', (req, res) => {

    decoded = jwt.decode(req.body.token, secret);
    let email = decoded;
    let usertype = req.body.usertype;
    console.log(usertype);
    if (usertype === 'Student') {
        const isValid = true;
        let sql = `SELECT * FROM students WHERE email='${email}'`
        db.query(sql, (err, result) => {
            if (err) {
                return res.status('500').send('error')
            }
            if (result.length === 0) {
                return res.status('400').send('user not found')
            }
            if (result.length !== 0) {
                console.log(isValid)
                return res.status('200').send({ isValid, name: result[0].student_name })
            }
        })

    }
    if (usertype === 'Department') {
        const isValid = true;
        let sql = `SELECT * FROM admin WHERE email='${email}'`
        db.query(sql, (err, result) => {
            if (err) {
                return res.status('500').send('error')
            }
            if (result.length === 0) {
                return res.status('400').send('user not found')
            }
            if (result.length !== 0) {
                console.log(isValid)
                console.log('admin verified')
                return res.status('200').send({ isValid, name: result[0].name })
            }
        })


    }



})


// app.post('/verifyadmin', (req, res) => {

//     decoded = jwt.decode(req.body.token, secret);
//     let email = decoded;
//     const isValid = true;
//     let sql = `SELECT * FROM admin WHERE email='${email}'`
//     db.query(sql, (err, result) => {
//         if (err) {
//             return res.status('500').send('error')
//         }
//         if (result.length === 0) {
//             return res.status('400').send('user not found')
//         }
//         if (result.length !== 0) {
//             console.log(isValid)
//             return res.status('200').send({ isValid, name: result[0].Name})
//         }
//     })


// })


app.post('/student/addcourse', (req, res) => {
    console.log('log1')

    let decodedemail = jwt.decode(req.body.token, secret);
    console.log(decodedemail)
    let sql = `SELECT studentid FROM students where email='${decodedemail}'`
    db.query(sql, (err, result1) => {
        console.log('log2')
        if (err) {
            return res.status('500').send('Server Error')
        }

        req.body.time.map((timeeachcourse, index) => {
            let studentid = `${result1[0].studentid}`
            let sql = `SELECT * FROM studentcourse WHERE time='${timeeachcourse}' AND students_studentid='${studentid}'`
            db.query(sql, (err, result) => {
                console.log('log4')
                if (err) {
                    console.log('log5')
                    return res.status('200').send('Server Error')
                }


                if (result.length === 0) {
                    console.log('log7')
                    console.log('next: insert')
                    let post = { Courses_courseid: req.body.courseid[index], students_studentid: result1[0].studentid, time: timeeachcourse }
                    let sql = `INSERT INTO  studentcourse SET ?`

                    db.query(sql, post, (err, result) => {
                        // console.log('log6')
                        if (err) {

                            return res.status('500').send('error')
                        }
                        
                let sql = `SELECT * FROM studentcourse WHERE time='${timeeachcourse}' 
                
                AND Courses_courseid= '${req.body.courseid[index]}'`
                db.query(sql, (err, result0) => {
                    
                    if (err) {
                        return res.status('500').send('Server Error')
                    }
                    
                    console.log('enroll check')
                   
                    console.log('student enrolled count')
                     
                        console.log(result0.length)
                        let sql = `UPDATE courses set studentsenrolled ='${result0.length }' WHERE  courseid='${req.body.courseid[index]}'`
                        db.query(sql, (err, result) => {
                            console.log('update sql')
                            if (err) {
                                return res.status('500').send('Server Error')
                            }
                        })
                     

                })

                    })

                }

            })





        })
        // console.log('log5')        )

    }
    )
    res.status(200).send("Added Courses");
})
app.post('/admin/registercourses', (req, res) => {
    console.log('log1')

    let sql = `SELECT * FROM courses WHERE courseid='${req.body.courseid}'`
    db.query(sql, (err, result) => {
        if (err) {
            return res.status('200').send('Server Error')
        }
        if (result.length !== 0) {
            return res.status('400').send('Course Already Exists')
        }
        if (result.length === 0) {
            let post = {
                courseid: req.body.courseid,
                course_name: req.body.coursename,
                time: req.body.time,
                section: req.body.section,
                room: req.body.room,
                teacher: req.body.teacher,
                building: req.body.building,
                credithours: req.body.credithours,
                capacity: req.body.capacity
            }
            let sql = `INSERT INTO courses SET ?`
            db.query(sql, post, (err, result) => {
                if (err) {
                    return res.status('400').send('Server Error')
                }
                return res.status('200').send(result)
            })


        }

    })


})



app.post('/student/removecourses', (req, res) => {
    console.log('log1')

    let decodedemail = jwt.decode(req.body.token, secret);
    console.log(decodedemail)
    let sql = `SELECT studentid from students WHERE email='${decodedemail}'`
    db.query(sql, (err, result) => {
        console.log('log2')
        if (err) {
            return res.status('400').send('Server Error')
        }
        console.log('log3')


        let courseid = req.body.courseid;
        console.log(courseid)
        let studentid = result[0].studentid;
        console.log(studentid)
        let sql = `DELETE FROM studentcourse WHERE Courses_courseid='${courseid}' AND students_studentid='${studentid}'`
        db.query(sql, (err, result) => {
            console.log('log4')
            if (err) {
                console.log('log5')
                return res.status('400').send('Server error')
            }
            console.log('log6')
            let sql = `SELECT studentsenrolled FROM courses WHERE courseid='${courseid}'`
            db.query(sql, (err, result2) => {
                console.log('log7')
                if (err) {
                    return res.status('500').send('Server Error')
                }
                console.log(result2.length)
                let sql = `UPDATE courses SET studentsenrolled= '${result2.length }' WHERE courseid='${courseid}'`
                db.query(sql, (err, result) => {
                    console.log('log8')
                    if (err) {
                        return res.status('400').send('Servere Error')
                    }
                })


            })

            return res.status('200').send(result)

        })

    })

})

app.post('/mycourses', (req, res) => {

    let decodedemail = jwt.decode(req.body.token, secret);

    let sql = `SELECT studentid FROM students WHERE email='${decodedemail}'`
    db.query(sql, (err, result) => {

        if (err) {
            return res.status('400').send('server error')
        }

      
        let sql = `SELECT Courses_courseid from studentcourse where students_studentid='${result[0].studentid}'`
        db.query(sql, (err, result1) => {
            if (err) {
                console.logg('error')
                return res.status('500').send('Server error')
            }

            // console.log(result1);
            return res.status('200').send(result1)

        })
    })
})
// Select posts
app.get('/admin/retrieveadmin/:olemissid', (req, res) => {
    let sql = `SELECT * FROM admin WHERE olemissid= '${req.params.olemissid}'`;
    let query = db.query(sql, (err, results) => {
        if (err) throw err;

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
app.post('/student/getcourses', (req, res) => {
    let sql = `SELECT * FROM courses`;
    db.query(sql, (err, result) => {
        if (err) {
            return res.status('500').send('Server Error');
        }
        if (result.length !== 0) {

            return res.status('200').send(result);

        }

    })
})

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



        res.send('admin deleted...');
    });
});

app.listen('5000', () => {
    console.log('Server started on port 5000');
});