// Requires
var express = require('express');
var middleware = require('./middleware');
var todos = [{
    id: 1,
    description: 'Meet mom for lunch',
    completed: false,
}, {
    id: 2,
    description: 'Go to the market',
    completed: false
}, {
    id: 3,
    description: 'Create a business directory and profit',
    completed: true
}];

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

app.get('/', function(req, res) {
    res.send('Todo API Root');
});

// GET /todos
app.get('/todos', function(req, res) {
    res.json(todos);
});

// Get /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoID = parseInt(req.params.id);
    var matchedTodo;

    todos.forEach(function(todo){
        if(todoID === todo.id) {
            matchedTodo = todo;
        }
    });

    if(matchedTodo) {
        res.json(matchedTodo);
    } else {
        res.status(404).send();
    }
});

// Start the server
app.listen(PORT, function() {
    console.log('Express listening on port:' + PORT);
});