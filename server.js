// Requires
var express = require('express');
var middleware = require('./middleware');
var bodyParser = require('body-parser');
var _ = require('underscore');

// Server Vars
var app = express();
var PORT = process.env.PORT || 3000;

// Vars
var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

// Log requests
app.use(middleware.logger);

// Log about page specificly
//app.get('/about', middleware.requireAuthentication, function(req, res) {
//    res.send('About Us');
//});

// Use any html file in the public folder
//app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function(req, res) {
    res.json(todos);
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoID = parseInt(req.params.id);
    var matchedTodo = _.findWhere(todos, {id: todoID});

    if(matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

// POST /todos
app.post('/todos', function(req, res) {

    var body = _.pick(req.body, 'description', 'completed');

    if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
       return res.status(400).send('You are missing a value');
    }

    body.description = body.description.trim();

    body.id = todoNextId++;

    todos.push(body);
    res.json(todos);
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});

    if(!matchedTodo) {
        res.status(404).json({"error": "no todo found with that ID"});
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo);
    }
});

// Start the server
app.listen(PORT, function() {
    console.log('Express listening on port:' + PORT);
});