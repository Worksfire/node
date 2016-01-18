// Requires
var express = require('express');
var middleware = require('./middleware');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
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
    var query = req.query;
    var where = {};

    if(query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if(query.hasOwnProperty('completed') && query.completed === 'false') {
        where.completed = false;
    }

    if(query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%'+query.q+'%'
        };
    }

    db.todo.findAll({where: where}).then(function(todos) {
        if(todos) {
            res.json(todos);
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    });
});

// GET /todos/:id
app.get('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);

    db.todo.findById(todoId).then(function(todo) {
        if(!!todo) {
            res.json(todo.toJSON());
        } else {
            res.status(404).send();
        }
    }, function(e) {
        res.status(500).send();
    });
});

// POST /todos
app.post('/todos', function(req, res) {
    var body = _.pick(req.body, 'description', 'completed');

    db.todo.create(body).then(function(todo) {
        res.json(todo.toJSON());
    }, function (e) {
        res.status(400).json(e);
    });
});

// POST /users
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');

    db.user.create(body).then(function(user) {
        res.json(user.toPublicJSON());
    }, function (e) {
        res.status(400).json(e);
    });
});

// DELETE /todos/:id
app.delete('/todos/:id', function(req, res){
    var todoId = parseInt(req.params.id, 10);

    db.todo.destroy({
        where: {
            id: todoId
        }
    }).then(function(rowsDeleted) {
        if(rowsDeleted === 0) {
            res.status(404).send({
                error: 'No todo with id'
            });
        } else {
            res.status(204).send();
        }
    }, function(e) {
        res.status(500).send();
    });
});

// PUT /todos/:id
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var body = _.pick(req.body, 'description', 'completed');
    var attributes = {};

    if(body.hasOwnProperty('completed')) {
        attributes.completed = body.completed;
    }
    if(body.hasOwnProperty('description')) {
        attributes.description = body.description;
    }

    db.todo.findById(todoId).then(function(todo) {
        if(todo) {
            return todo.update(attributes).then(function(todo) {
                res.json(todo.toJSON());
            }, function(e) {
                res.status(400).send(e);
            });
        } else {
            res.status(404).send();
        }
    }, function() {
        res.status(500).send();
    });
});

// USE {force:true} inside sync() to drop tables and rebuild
db.sequelize.sync().then(function() {
    // Start the server
    app.listen(PORT, function() {
        console.log('Express listening on port:' + PORT);
    });
});