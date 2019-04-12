var express = require('express');

var app = express();
var debug = require('debug')('app');
var morgan = require('morgan');
var chalk = require('chalk');
var fs = require('fs');
var str = require('stringify');

var https = require('https');

var path = require('path');
var bodyParser = require('body-parser');

var myRouter = express.Router();


//Database Connection
const mysql = require('mysql');
var config = {
    host: 'wwwdatabase.mysql.database.azure.com',
    user: 'zuka98@wwwdatabase',
    password: 'wellwellwell!23',
    database: 'ukwellbeing',
    port: 0,
    ssl: true
};

// const conn = new mysql.createConnection(config);

function getNumberOfWeek() {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    const pastDaysOfYear = (today - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}


function insertToDatabase(postcode, score, errorRate) {
    const conn = new mysql.createConnection(config);
    var tbname = 'w' + getNumberOfWeek();

    conn.query('CREATE TABLE IF NOT EXISTS ?? (id INT AUTO_INCREMENT PRIMARY KEY , postcode VARCHAR(10), score INTEGER, errorRate INTEGER , time_stamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP);', [tbname],
    function (err, results, fields) { 
        if (err) throw err; 
        console.log("Created Table");
    })
    
    conn.query('INSERT INTO ?? (postcode, score, errorRate) VALUES (?, ?, ?);', [tbname, postcode, score, errorRate],
        function (err, results, fields) {
            if (err) throw err;
            else {
                console.log('Inserted ' + results.affectedRows + ' row(s).' + "tbname" + tbname);
            }
        })

    conn.end(function (err) {
        if (err) throw err;
        else console.log('Done.')
    });
}

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(morgan('tiny'))
// One I added recently
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));
app.use('/fonts', express.static(path.join(__dirname, 'public/fonts')));

app.use(express.static(path.join(__dirname, '/public/')));



app.set('views', './src/views');
app.set('view engine', 'ejs');

// Use of myRouter should be last thing
app.use('/', myRouter);



myRouter.route('/androidquery')
    .post((req, res) => {
        console.log(req.body);
        var message = req.body;
        insertToDatabase(message.postcode, message.score, message.errorRate);
        res.end("Finish");
    })


    function getTablenames(){
        const conn = new mysql.createConnection(config);
        conn.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE "w__" OR  TABLE_NAME LIKE "w_"'),
        function (err, results) {
            if (err) {
                debug.log(err);
            }
            else{ 
                 console.log("hey");
            }
            }
            conn.end(function (err) {
                if (err) throw err;
            });
    }


app.get('/', function (req, res) {
    getTablenames();
    res.render('index', {
        title: 'MyLibrary',
        nav: [{ link: '/', title: 'Home' }, { link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }]
    });
});



//To display mock up data for demo purposes
myRouter.route('/demomap').get((req, res) => {
    res.render('map_demo', {
        title: 'MyLibrary',
        nav: [{ link: '/', title: 'Home' }, { link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }]

    });
})






myRouter.route('/map').get((req, res) => {
        // console.log(req.url);
        // var myURL = 'UK-Adresses/' + req.url.split('?')[1];
      
        const conn = new mysql.createConnection(config);
        conn.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME  LIKE "w__";',
        function (err, results) {
            if (err) {
                debug.log(err);
            }
            else{ 
            res.render('map', {
                title: 'Map',
                nav: [{ link: '/', title: 'Home' }, { link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }],
                weektables: results,
            });
            }
        })
        
        conn.end(function (err) {
            if (err) throw err;
        });    
})


myRouter.route('/UK-Adresses')
    .get((req, res) => {
        var myURL = 'UK-Adresses/' + req.url.split('?')[1] + '.geojson';
        let rawdata = fs.readFileSync(myURL);
        jsondata = JSON.parse(rawdata);
        res.send(jsondata);
        res.end("Finish");
    })

//--- Queries to send data to database  Purely for testing purposes---
myRouter.route('/query').get((req, res) => {
    const conn = new mysql.createConnection(config);
    conn.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME  LIKE "w__";',
    function (err, results) {
        if (err) {
            debug.log(err);
        }
        else{ 
            res.send(results);
            }
        })
        
        conn.end(function (err) {
            if (err) throw err;
        });
        
})


myRouter.route('/loadWeekData').get((req, res) => {
    var weekNum = req.url.split('?')[1];
    const conn = new mysql.createConnection(config);
   
    conn.query('SELECT postcode as name, AVG(score) as avgscore, COUNT(postcode) as quantity FROM ?? GROUP BY (postcode);',[weekNum],
    function (err, results) {
        if (err) {
            debug.log(err);
        }
        else{ 
            var mapDataArray = [];
            for(var i = 0; i < results.length; i++){
                mapDataArray.push({ 'name' : results[i].name, 'avgscore' : results[i].avgscore , 'quantity' : results[i].quantity})
            }  
            
            res.send(results);
            }
        })
        
        conn.end(function (err) {
            if (err) throw err;
        });
 
})




const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`listening on ${chalk.green('port 3000')}`);
    console.log("Server running at http://localhost:%d", 3000);
});