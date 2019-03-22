var express = require('express');

var app = express();
var debug = require('debug')('app');
var morgan = require('morgan');
var chalk = require('chalk');
var fs = require('fs');
var str = require('stringify');

var path = require('path');
var bodyParser = require('body-parser');

var myRouter = express.Router();


//Database Connection
const mysql = require('mysql');
var config = {
    host: 'wwwdatabase.mysql.database.azure.com',
    user: 'zuka98@wwwdatabase',
    password: 'wellwellwell!23',
    database: 'testdb',
    port: 0,
    ssl: true
};

// const conn = new mysql.createConnection(config);

function insertToDatabase(postcode, score, errorRate) {
    conn.query('INSERT INTO wellbeingdata (postcode, score, errorRate) VALUES (?, ?, ?);', [postcode, score, errorRate],
        function (err, results, fields) {
            if (err) throw err;
            else {
                console.log('Inserted ' + results.affectedRows + ' row(s).');
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

app.use(express.static(path.join(__dirname, '/public/')));
app.use('/css', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname, 'node_modules/jquery/dist')));


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

app.get('/', function (req, res) {
    res.render('index', {
        title: 'MyLibrary',
        nav: [{ link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }]
    });
});


myRouter.route('/map').get((req, res) => {
        const conn = new mysql.createConnection(config);
        conn.query('SELECT postcode as name, AVG(score) as avgscore, COUNT(postcode) as quantity FROM testdb.wellbeingdata GROUP BY (postcode);',
        function (err, results) {
            if (err) {
                debug.log(err);
            }
            else{ 
            var mapDataArray = [];
            
            for(var i = 0; i < results.length; i++){
                mapDataArray.push({ 'name' : results[i].name, 'avgscore' : results[i].avgscore , 'quantity' : results[i].quantity})
            }  
        
            res.render('map', {
                title: 'Map',
                nav: [{ link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }],
                mapData: mapDataArray,
            });
            }
        })
        
        conn.end(function (err) {
            if (err) throw err;
        });

        
})

//To display mock up data for demo purposes
myRouter.route('/demomap').get((req, res) => {
    res.render('map_demo', {
        title: 'MyLibrary',
        nav: [{ link: '/map', title: 'Map' }, { link: '/demomap', title: 'Map-Demo' }]

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

//--- Queries to send data to database ---
myRouter.route('/query')
    .get((req, res) => {
        res.send("Hello ");
        insertToDatabase(message.postcode, message.score, message.errorRate);

    })


const port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log(`listening on ${chalk.green('port 3000')}`);
    console.log("Server running at http://localhost:%d", 3000);
});