// set up ======================================================================
var express  = require('express');
var app      = express();    // create our app w/ express
var mongoose = require('mongoose');    // mongoose for mongodb
var server = require('http').createServer(app);

// configuration ===============================================================
server.listen(process.env.PORT || 3000);
mongoose.connect('mongodb://user:pass123@ds111559.mlab.com:11559/studia');         // połączenie z bazą danych, conectionstring

app.configure(function() {
        app.use(express.static(__dirname + '/public'));    // set the static files location /public/img will be /img for users
        app.use(express.logger('dev'));        // na konsoli błędy
        app.use(express.bodyParser());         // pull information from html in POST, z zadania wyciaga parametry
        app.use(express.methodOverride());     // simulate DELETE and PUT, pozwala nowe sciezki
});

// define model ================================================================
var Todo = mongoose.model('Todo', {  //aplikacja ma zazadanie zarzadzac prosta lista to do - tworzyc nowe to do i usuwa stare
                                        // stad przechowuje dwa text i czy done
        text : String,
        done : Boolean
});

// routes ======================================================================

        // api ---------------------------------------------------------------------
        // get all todos
        app.get('/api/todos', function(req, res) {

                // use mongoose to get all todos in the database, odwołujemy sie do kolekcji to do i wyszukujemy metodą find
                Todo.find(function(err, todos) {

                        // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                        if (err)
                                res.send(err)

                        res.json(todos); // return all todos in JSON format
                                        // te dane i tak są jsonowe ale jeszcze dla pewnosci
                });
        });

        // create todo and send back all todos after creation, kolejne zadanie tym razem typu post - oznacza, ze cos chcemy dodac do
        app.post('/api/todos', function(req, res) {

                // create a todo, information comes from AJAX request from Angular, wiemy ze mamy body parsowanie
                Todo.create({
                        text : req.body.text, // to zapisujemy do teksta
                        done : false // jeszcze nie jest wykonane
                }, function(err, todo) { // jak sie nie uda to robimy error
                        if (err)
                                res.send(err);

                        // get and return all the todos after you create another, a jak sie uda to find
                        // wiemy co wysylamy, ale nie zczytujemy statusu
                        Todo.find(function(err, todos) {
                                if (err)
                                        res.send(err)
                                res.json(todos);
                        });
                });

        });
      app.put('/api/todos/:todo_id', function(req, res) {
      var actual;
      Todo.findById(req.params.todo_id, function(err, todo) {
                actual = todo.done;
        
            Todo.update( { _id: req.params.todo_id },
                { done: !actual
                 }, function(err, todo) {
                    if (err)
                            res.send(err);
                    Todo.find(function(err, todos) {
                            if (err)
                                    res.send(err)
                            res.json(todos);
                    });
            });
    });
 });
        // delete a todo w azdaniu pojawia sie token todo_id
        app.delete('/api/todos/:todo_id', function(req, res) {
                Todo.remove({
                        _id : req.params.todo_id //usuwam element o takim _id - odczytuje parametry, ktore pojawiaja sie w zapytaniu - w query stringu
                }, function(err, todo) {
                        if (err)
                                res.send(err);

                        // get and return all the todos after you create another
                        Todo.find(function(err, todos) {
                                if (err)
                                        res.send(err)
                                res.json(todos);
                        });
                });
        });

        // application -------------------------------------------------------------
        app.get('*', function(req, res) {
                res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
        });

// listen (start app with node server.js) ======================================


