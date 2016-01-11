// Requires
var express = require('express');
var middleware = require('./middleware');

// Server Vars
var app = express();
var PORT = process.env.PORT || 3000;

// Log requests
app.use(middleware.logger);

// Log about page specificly
//app.get('/about', middleware.requireAuthentication, function(req, res) {
//    res.send('About Us');
//});

// Use any html file in the public folder
//app.use(express.static(__dirname + '/public'));

app.get('/', function() {
    res.send('Todo API Root');
});

app.listen(PORT, function() {
    console.log('Express listening on port:' + PORT);
});