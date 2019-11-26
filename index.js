var express = require('express');
var app = express();
var debug = require('debug')('app');
var morgan = require('morgan');
var chalk = require('chalk');
var fs = require('fs');

var path = require('path');
var bodyParser = require('body-parser');

var myRouter = express.Router();


//Database Connection
const mysql = require('mysql');
var config = {
    //Configuration Required for usage
    // host: '',
    // user: '',
    // password: '',
    // database: '',
    // port: 0,
    // ssl: true
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


function getDateOfISOWeek(w, y) {
        //Add formating so it does DAY-Month
        var simple = new Date(y, 0, 1 + (w - 1) * 7);
        var dow = simple.getDay();
        var ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }

function getYear(){
    var date = new Date();
    return date.getFullYear();
}

function formatDates(startDate){
    var dd1 = startDate.getDate();
    var mm1 = startDate.getMonth() + 1;
    if(dd1 < 10){
        dd1 = "0" + dd1;
    }
    if (mm1 < 10){
        mm1 = "0" + mm1;
    }
    
    var endDate = new Date(startDate.getFullYear(),startDate.getMonth(),startDate.getDate()+7)
    
    dd2 = endDate.getDate();
    mm2 = endDate.getMonth() + 1;
    if(dd2 < 10){
        dd2 = "0" + dd2;
    }
    if (mm2 < 10){
        mm2 = "0" + mm2;
    }

    var formattedData = dd1 + ":" + mm1 + " - " + dd2 + ":" + mm1;
    return formattedData;
}

app.get('/', function (req, res) {
    res.render('index', {
        title: 'MyLibrary',
        nav: [{ link: '/', title: 'Home' }, { link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }]
    });
});

function getDateOfISOWeek(w, y) {
    var simple = new Date(y, 0, 1 + (w - 1) * 7);
    var dow = simple.getDay();
    var ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}


//To display mock up data for demo purposes
myRouter.route('/demomap').get((req, res) => {
    res.render('map_demo', {
        title: 'MyLibrary',
        nav: [{ link: '/', title: 'Home' }, { link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }]
    });
})



myRouter.route('/map').get((req, res) => {
        const conn = new mysql.createConnection(config);
        conn.query('SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME  LIKE "w__";',
        function (err, results) {
            if (err) {
                debug.log(err);
            }
            else{ 
           
            var temp1 = getDateOfISOWeek(15, getYear());
            formatDates(temp1);
            
            var dates = [];
            for(var i = 0; i < results.length; i++){
                dates.push(formatDates(getDateOfISOWeek(results[i].TABLE_NAME.substring(1,3),getYear())));
                console.log(dates);
            }
           
            res.render('map', {
                title: 'Map',
                nav: [{ link: '/', title: 'Home' }, { link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }],
                weektables: results,
                dates: dates,
            });
            }
        })
        
        conn.end(function (err) {
            if (err) throw err;
        });    
})


myRouter.route('/Postcode_Polygons')
    .get((req, res) => {
        var myURL = 'Postcode_Polygons/' + req.url.split('?')[1] + '.geojson';
        let rawdata = fs.readFileSync(myURL);
        jsondata = JSON.parse(rawdata);
        res.send(jsondata);
        res.end("Finish");
    })

//--- Queries to send data to database for testing purposes---
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