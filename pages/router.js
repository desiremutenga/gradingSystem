const express = require('express');
const { route } = require('express/lib/router');
const db = require('../db');
const router = express.Router();
const path =require('path');
var XLSX = require('xlsx');
var multer = require('multer');
const res = require('express/lib/response');
const { Console, error } = require('console');

    //file upload
    var storage = multer.diskStorage({
        destination: function (req,file,cb) {   
        cb(null,'data');//folder to store uploaded files   
    },
    filename: function(req,file,cb) {    
        cb(null, 'marks' + '.xlsx');       
    }})
    
//Max Size
    const maxSize = 1 * 1000 * 1000;   
    var upload = multer({
        storage: storage,
        limits: {fileSize:maxSize},
        fileFilter: function(req,file,cb) {  
            var filetypes = /|xlsx|/;
            var mimetype = filetypes.test(file.mimetype); 
            var extname = filetypes.test(path.extname(
                file.originalname).toLowerCase());   
                if(mimetype && extname){
                    return cb(null,true);
    
                }
    
                cb('Error: File upload only supports the' + 'following types -' + filetypes);           
        }
    
    }).single('id');



//Upload
router.post('/fileupload',(req,res,next)=>{

    upload(req,res,(err)=>{

        if(err){
            res.send(err);
        }
        else{
            res.send('Success, File Uploaded');          
        }
    })
});



//view grade
router.get('/viewgrade/:id',(req,res)=>{
    const id = req.params.id;

    db.query(`SELECT * FROM grade${1}`,(error,result)=>{


    })

})




//import
router.post('/import',(req,res)=>{
        //table creation
     const{term} = req.body; 

     const date = new Date();
     let year = date.getFullYear();
     let cls = req.session.cls;

     if(req.session.cls){
        db.query(`create table if not exists ${cls}${term}${year}(
            id int auto_increment primary key,
            regnum varchar(100),
             name varchar(100),
             surname varchar(100),
             maths varchar(100),
             shona varchar(100),
             english varchar(100),
             agriculture varchar(100),
             ict varchar(100),
             heritage varchar(100),
             pe varchar(100),
             comments varchar(100));`)
   
        // import
        var workbook = XLSX.readFile("./data/marks.xlsx");
        let worksheet = workbook.Sheets[workbook.SheetNames[0]];

        res.send('Imported'); 
    for(let index= 2;index<80;index++){
        const regnum = worksheet[`B${index}`].v;
        const name = worksheet[`C${index}`].v;
        const surname = worksheet[`D${index}`].v;
        const maths = worksheet[`E${index}`].v;
        const shona = worksheet[`F${index}`].v;
        const english = worksheet[`G${index}`].v;
        const agriculture = worksheet[`H${index}`].v;
        const ict = worksheet[`I${index}`].v;
        const heritage = worksheet[`J${index}`].v;
        const pe = worksheet[`K${index}`].v;
        const comments = worksheet[`L${index}`].v;
    
        //INSERT TO DB
        db.query(`INSERT INTO ${cls}${term}${year} SET?`,{regnum:regnum,name:name, surname:surname,maths:maths,shona:shona,english:english,agriculture:agriculture,ict:ict,heritage:heritage,pe:pe,comments:comments},(error,result)=>{
            if(error) throw error
        })
    } 

     }else{
         res.redirect('/login');
     }  
})


router.get('/submit',(req,res)=>{

    res.render('submit');

});

//login form

router.get('/login',(req,res)=>{

    res.render('login',{Message:''});
});

router.get('/teacher',(req,res)=>{
    
        res.render('teacher',{marks:''});


})


//Login
router.post('/login',(req,res)=>{

    const {username,password} = req.body;

    db.query('SELECT * FROM teachers WHERE username = ? AND password = ?',[username,password],async(error,result)=>{
        if(error) throw error;

        if(result.length==1){
            let cls = result[0].class;
            req.session.cls = cls;
            db.query(`SELECT * FROM ${cls}`,(error,result)=>{
                if(error) throw error

                let marks = [];
                marks = result;
                res.render('teacher',{marks});

            })
          
        }else{
            db.query('SELECT * FROM headmaster WHERE username=? AND password=?',[username,password],async(error,result)=>{
                if(error) throw error

                if(result.length ==1){
                    let data = [];
                    let num = '';

                    res.render('index',{data,num});
                }else{
                   db.query('SELECT * FROM parents WHERE regnum =? AND password =?',[username,password],async(error,result)=>{

                    if(error) throw error;

                    if(result.length==1){
                        req.session.parentName = username;
                        res.render('results');
                    }else{
                        res.render('login',{Message:'Account not found!'})
                    }
                   })
                }


            })
        }


    })

   


})

router.get('/dash',(req,res)=>{
    res.render('results');
})

//view results
router.get('/viewresults',(req,res)=>{

    res.render('viewresults',{details:''});


});

//view perfomance
router.get('/viewPerfomance',(req,res)=>{
    let data = [];

    res.render('perfomance',{data});
})

//populate graph
router.post('/populategraph',(req,res)=>{
    const{year,term,cls} = req.body;

    db.query(`SELECT * FROM ${cls}${term}${year}`,(error,result)=>{

        if(error) throw error

        let math = result[0].maths;
        let eng = result[0].english;
        let shona = result[0].shona;
        let ict = result[0].ict;
        let heritage = result[0].heritage;
        let pe = result[0].pe;
        let agriculture = result[0].agriculture;

        let marks = [];
        marks.push(math);
        marks.push(eng);
        marks.push(shona);
        marks.push(ict);
        marks.push(heritage);
        marks.push(pe);
        marks.push(agriculture);

        res.render('perfomance',{data:marks})

    })
})

//view results
router.post('/viewresults',(req,res)=>{

    const{year,term,cls}= req.body;

     if(!req.session.parentName){

        res.redirect('/login');
     }else{

        db.query(`SELECT * FROM ${cls}${term}${year} WHERE regnum =?`,[req.session.parentName],async(error,result)=>{
            if(error) throw error;

            let details = [];
            details = result;

            res.render('viewresults',{details});


        })
     }


})




//home
router.get('/',(req,res)=>{
  res.render('login',{Message:''});
})


//headmaster dash
router.get('/headmaster',(req,res)=>{

  let data = [];
  let num = '';

    res.render('index',{data,num});
});



//RESULTS
router.get('/viewresults',(req,res)=>{
    let regnum = req.session.regnum;
    
})



//view tables
router.get('/tables',(req,res)=>{
    res.render('tables',{records:'',num:''}) 
});

//populate table
router.post('/populatetbl',(req,res)=>{
    
    const{year,term,cls} = req.body;

    db.query(`SELECT * FROM ${cls}${term}${year}`,async(error,result)=>{
        if(error) throw error;

        let records = [];
        records = result;

        db.query(`SELECT COUNT(*) AS num FROM ${cls}${term}${year}`,async(error,result)=>{
            if(error) throw error;

            let num =result[0].num;

            res.render('tables',{num,records});
        })
    })   
})

//logout
router.get('/logout',(req,res)=>{

    req.session.destroy();
    res.redirect('/login');
})

//search
router.post('/search',(req,res)=>{
    const{year,term,cls} = req.body;

   db.query(`SELECT AVG(maths) AS mathave,AVG(english) AS engave ,AVG(shona) AS shoave,AVG(heritage) AS herave,AVG(agriculture) AS agrave,AVG(ict) AS ictave,AVG(pe) AS peave FROM ${cls}${term}${year}`,(error,result)=>{
       if(error){
           res.send('Marks not yet available')
       }else{

        
    let math = result[0].mathave;
    let eng = result[0].engave;
    let shona = result[0].shoave;
    let heritage = result[0].herave;
    let agric = result[0].agrave;
    let ict = result[0].ictave;
    let pe = result[0].peave;

    let averages = [];
    averages.push(math);
    averages.push(eng);
    averages.push(shona);
    averages.push(heritage);
    averages.push(agric);
    averages.push(ict);
    averages.push(pe);

    db.query(`SELECT COUNT(*) AS num FROM ${cls}${term}${year}`,(error,result)=>{
        if(error) throw error;
        let num = result[0].num;
        res.render('index',{data:averages,num});

    })

       }
   })



})


//view submit form
router.get('/upload',(req,res)=>{
    res.render('submit');
})

//view teacher
router.get('/teacher',(req,res)=>{


    res.render('table');
})


//view table
router.get('/tables',(req,res)=>{
    res.render('teachertable');
})


//Parents Dashboard
router.get('/parentdash',(req,res)=>{

})


//Headmaster
router.get('/headdash',(req,res)=>{

})

//Search
router.get('/search',(req,res)=>{

})


//Add Marks
router.get('/addmarks',(req,res)=>{

})


module.exports = router;
