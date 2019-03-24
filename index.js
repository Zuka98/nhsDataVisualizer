var express = require('express');

var app = express();
var debug = require('debug')('app');
var morgan = require('morgan');
var chalk = require('chalk');

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

function insertToDatabase(postcode, score,errorRate){  
    const conn = new mysql.createConnection(config);

// Dropping and initializing table again
//     conn.query('DROP TABLE IF EXISTS wellbeingdata;', function (err, results, fields) { 
//     if (err) throw err; 
//     console.log('Dropped wellbeingdata table if existed.');
// })
// conn.query('CREATE TABLE wellbeingdata (id serial PRIMARY KEY, postcode VARCHAR(10), score INTEGER, errorRate INTEGER);', 
//     function (err, results, fields) {
//         if (err) throw err;
//     console.log('Created wellbeingdata table.');
// })

conn.query('INSERT INTO wellbeingdata (postcode, score, errorRate) VALUES (?, ?, ?);', [postcode, score, errorRate], 
    function (err, results, fields) {
        if (err) throw err;
    else {
        console.log('Inserted ' + results.affectedRows + ' row(s).');
    }
})

conn.end(function (err) { 
if (err) throw err;
else  console.log('Done.') 
});
}


app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(morgan('tiny'))
app.use(express.static(path.join(__dirname,'/public/')));
app.use('/css', express.static(path.join(__dirname,'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname,'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname,'node_modules/jquery/dist')));

app.set('views', './src/views');
app.set('view engine', 'ejs');

// Use of myRouter should be last thing
app.use('/',myRouter);


myRouter.route('/androidquery')
    .post((req,res) => {
        console.log(req.body);
        var message = req.body;
        insertToDatabase(message.postcode, message.score, message.errorRate);
        res.end("Finish");
})


app.get('/', function(req,res){
    res.render('index', {
     title: 'MyLibrary',
     nav: [{link: '/map',  title: 'Map'}]
    });
}); 


//--- Queries to send data to database ---
myRouter.route('/query')
    .get((req,res) => {
        res.send("Hello ");
        insertToDatabase(message.postcode, message.score, message.errorRate);

})


const port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log(`listening on ${chalk.green('port 3000')}`);
    console.log("Server running at http://localhost:%d", 3000);
});