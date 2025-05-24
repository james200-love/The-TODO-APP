

var bodyParser = require('body-parser');
var mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Import bcrypt
var session = require('express-session'); // Require express-session
const validator = require('validator'); // You'll need to install this package: npm install validator

// authentication middleware function. This middleware will check if a user's ID exists in the session. If it does, it means the user is logged in, and
//  we'll allow them to proceed to the next route handler (e.g., for /todo). If not, we'll redirect them to the login page.

function isAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        // User is authenticated, proceed to the next middleware/route handler
        return next();
    } else {
        // User is not authenticated, redirect to login
        res.redirect('/login');
    }
}

//connect to the database
mongoose.connect('mongodb://localhost:27017/todoapp');

var todoSchema = new mongoose.Schema({
    item: String,// item field
    priority: String, //  priority field
    dueDate: Date, // date field
    category: String, 
    user: String // 
});
var Todo = mongoose.model('Todo', todoSchema);



// User Schema
var userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Ensure usernames are unique
    },
      email: { // Add the email field
        type: String,
        required: true,
        unique: true, // Optionally ensure emails are unique
        trim: true, // Remove whitespace from beginning and end
        lowercase: true // Save email in lowercase
    },
    password: {
        type: String,
        required: true
    }
});

// User Model
var User = mongoose.model('User', userSchema);

var urlencodedParser = bodyParser.urlencoded({extended: false});

module.exports = function(app){

    // login

    app.get('/login', (req, res) => {
        console.log("GET request to /login received");//(show these info in the server console ,terminal)
        res.render('login');
    });

// register
    app.get('/register', (req, res) => {
        console.log("GET request to /register received");//(show this info in the server console, terminal )
        res.render('register');
    });
    
// POST ROUTE(CLIENT) for registering new user
//Inside the try block, we generate a salt (saltRounds) and then use bcrypt.hash() to hash the user's password. 

app.post('/register', urlencodedParser, async (req, res) => {
    console.log("req.body:", req.body); // ADD THIS LINE to out put data on the server console(used for troubleshooting)

    console.log("req.body on register:", req.body);//this is to confirm if recieved data is in the (used for troubleshooting)

    const { username, email, password , confirmPassword} = req.body;

    if (!validator.isEmail(email)) {
        req.session.registerError = "Please enter a valid email address.";
        return res.redirect('/register');
    }

    if (password !== confirmPassword) {
        req.session.registerError = "Passwords do not match.";
    
        return res.redirect('/register');
    }

    if (password.length < 8) {
        req.session.registerError = "Password must be at least 8 characters long.";
        return res.redirect('/register');
    }

    try {
        // Hash the password
        const saltRounds = 10; // You can adjust this
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = new User({ username, email, password: hashedPassword , confirmPassword});
        await newUser.save();
        console.log(`New user registered: ${username} (${email})`);
        res.redirect('/login'); // Redirect to login after successful registration
    } 
    catch (error) {
    console.error("Error during registration:", error);
    if (error.code === 11000) {
        let errorMessage = 'Registration failed.';
        if (error.keyPattern && error.keyPattern.username) {
            errorMessage = 'Username already exists.';
        } else if (error.keyPattern && error.keyPattern.email) {
            errorMessage = 'Email address already exists.';
        }
        req.session.registerError = errorMessage;
    } else {
        req.session.registerError = 'Registration failed due to an unexpected error.';
        // Optionally, you could log the 'error' object more verbosely here for debugging other issues
    }
    res.redirect('/register');
}

});



//Login functionality itself ,,, Retrieve the username and password from the login form submission.,,,Find the user in the database by their username

//Compare the entered password with the password stored for that user.
//If they match, log the user in (using sessions) and redirect them to the /todo list
// We use bcrypt.compare(password, user.password) to compare the entered plain text password with the hashed password stored in the user object.
//bcrypt.compare() returns a boolean (true if the passwords match, false otherwise
// % session management

 // get data from mongodb pass data to view

 //LOGIN ROUTE(CLIENT)
app.post('/login', urlencodedParser, async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (user) {
            const passwordMatch = await bcrypt.compare(password, user.password);

            if (passwordMatch) {
                // Authentication successful
                req.session.userId = user._id; // Store user ID in session
                req.session.username = user.username; // Store username in session (optional)
                console.log(`User logged in: ${username} (Session ID: ${req.session.id})`);
                res.redirect('/todo');
            } else {
                console.log(`Login failed for user: ${username} (incorrect password)`);
                req.session.loginError = 'Incorrect password.';
                res.redirect('/login');
            }
        } else {
            console.log(`Login failed for user: ${username} (user not found)`);
            req.session.loginError = 'invalid username or password.';
            res.redirect('/login');
        }
    } catch (error) {
        console.error("Error during login:", error);
        req.session.loginError = 'login failed due to error';
        res.redirect('/login');
    }
});

// isAuthenticated , this function is for anthentication of user id sessions 
// this is a todo get route function ...fetches todo data, to  session username
   app.get('/todo', isAuthenticated, async function(req, res) {
    try {
        const username = req.session.username;
        const filterValue = req.query.filter;
        let query = { user: username }; // Fetch todos only for the logged-in user

        if (filterValue && filterValue !== 'all') {
            query.category = filterValue; // Filter by category if a value is provided
        }

        const data = await Todo.find(query);
        res.render('todo', { todos: data, user: { username: username } }); // Pass user info
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching todos');
    }
});

    // get data from client view to mongodb
    app.post('/todo', urlencodedParser, async function(req, res) {
         console.log("Received req.body:", req.body)// server console display of client data
        try {
            
            const username = req.session.username; // Get the username first
            const newTodo = new Todo({
                item: req.body.item,
                priority: req.body.priority,
                dueDate: req.body.dueDate, // Get the dueDate from req.body
                category: req.body.category, // Get the category from req.body
                user: username 
            });
            const data = await newTodo.save();
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to save todo item' });
        }
    });


     app.delete('/todo/:id', async function(req, res) {
        try {
            const idToDelete = req.params.id;
            const data = await Todo.deleteOne({ _id: idToDelete });
            res.json(data);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Failed to delete todo item' });
        }
    });
// logout functionality

    app.get('/logout', (req, res) => {
        req.session.destroy((err) => {
            if (err) {
                console.error("Error destroying session:", err);
                // Optionally redirect to an error page
                return res.redirect('/todo');
            }
            // Redirect the user to the login page after successful logout
            res.redirect('/login');
        });
    });
}
