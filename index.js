const express = require('express');
const path = require('path');
const session = require('express-session');
const pageRouter = require('./pages/router');
const { setInterval } = require('timers');
const PORT = 3000;


const app = express();

    //login session
    app.use(session({
        secret:'mysecret',
        resave:false,
        saveUninitialized:false,
        cookie:{}
    }));
    


//view engine
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//static files
app.use(express.static(path.join(__dirname,'./public')));

//Read data from forms
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.use('/',pageRouter);

app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
})

