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

// GET /todos?completed=BOOL&q=STRING
app.get('/todos', function(req, res) {
    var queryParams = req.query;
    var filteredTodos = todos;

    if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});
    } else if(queryParams.hasOwnProperty('completed') && queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});
    }

    if(queryParams.hasOwnProperty('q') && queryParams.q.trim().length > 0) {
        filteredTodos = _.filter(filteredTodos, function(todo) {
            return todo.description.toLocaleLowerCase().indexOf(queryParams.q) > -1;
        });
    }

    res.json(filteredTodos);
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

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    var body = _.pick(req.body, 'description', 'completed');
    var validAttribute = {};

    if(!matchedTodo) {
        return res.status(404).send('No matched todo');
    }

    if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
        validAttribute.completed = body.completed;
    } else if(body.hasOwnProperty('completed')) {
        return res.status(400).send('Completed must be a boolean');
    }

    if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0) {
        validAttribute.description = body.description;
    } else if(body.hasOwnProperty('description')) {
        return res.status(400).send('Description must be a string');
    }

    // Update the matched values
    _.extend(matchedTodo, validAttribute);

    res.json(matchedTodo);
});

// Start the server
app.listen(PORT, function() {
    console.log('Express listening on port:' + PORT);
});