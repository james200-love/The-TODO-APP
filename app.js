
const session = require('express-session');
var express = require('express');
var todoController = require('./controllers/todoController');
var bodyParser = require('body-parser');

var app = express();

// set templating engine
app.set('view engine','ejs');

//static files
app.use(express.static('./public'));

// Body parser middleware (should come before session
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Session middleware configuration
app.use(session({
    secret: 'dubai@2023',
    resave: false,
    saveUninitialized: false,
    Cookie: {
        httpOnly: true,
        maxAge: 3600000

    }
}));

// GET route to display the login page (can stay here) and alert messages
app.get('/login', (req, res) => {
    console.log("GET request to /login received");
    res.render('login', { session: req.session }); // Pass the session object;..note by default ejs doesn't access objects directly ,
    //  we have to just make them available
});
// GET rout to display the registration page and alert messages 
app.get('/register', (req, res) => {
    console.log("GET request to /register received");
    res.render('register', { session: req.session }); // Pass the session object
});

 todoController(app);

app.listen(3000);
console.log ('you a listenng to port 3000');