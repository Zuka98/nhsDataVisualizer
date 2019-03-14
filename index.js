var express = require('express');

var app = express();
var debug = require('debug')('app');
var morgan = require('morgan');
var chalk = require('chalk');

var path = require('path');

var myRouter = express.Router();

app.use(morgan('tiny'))
app.use(express.static(path.join(__dirname,'/public/')));
app.use('/css', express.static(path.join(__dirname,'node_modules/bootstrap/dist/css')));
app.use('/js', express.static(path.join(__dirname,'node_modules/bootstrap/dist/js')));
app.use('/js', express.static(path.join(__dirname,'node_modules/jquery/dist')));

app.set('views', './src/views');
app.set('view engine', 'ejs');

myRouter.route('/postRequest').get((req,res) => {
    res.render('index');
})

app.use('/',myRouter);

app.get('/', function(req,res){
    res.render('index', {
     title: 'MyLibrary',
     nav: [{link: '/map',  title: 'Map'},
           {link: '/authors',  title:'Authors'},
           {link: '/postrequest',  title:'PostRequest'}]
    });
}); 

app.listen(3000, function(){
    console.log(`listening on ${chalk.green('port 3000')}`);
    console.log("Server running at http://localhost:%d", 3000);
});