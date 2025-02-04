import pgPromise from "pg-promise";
import cors from "cors"
import dotenv from "dotenv";
import express from "express";
import { engine } from "express-handlebars";
import bodyParser from 'body-parser'
import flash from "connect-flash";
import session from "express-session";
import path from 'path';
import { fileURLToPath } from 'url';

//import routes
import home_route from "./src/routes/home.js";
import practice_route from "./src/routes/practice.js";
// import dashboard_route from "./src/routes/dashboard.js";
import testRoute from "./src/routes/test.js"



dotenv.config();

const pgp = pgPromise();

// SSL connection
let useSSL = false;
let local = process.env.LOCAL || false;
if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}

// Database connection
const connectionString = process.env.DATABASE_URL;
const database = pgp(connectionString);

// Service instances

//Routes instance
const home_route_instance = home_route()
const { practice, submit} = practice_route()

// const { } = dashboard_route()
const { test, submitAnswer } = testRoute();

// Express instance
const app = express();


// Middleware configuration
app.use(express.json());
app.use(cors());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//middleware configuration
app.use(
    session({
        secret: "ielts tool",
        resave: false,
        saveUninitialized: true,
    })
);
app.use(flash());
// Handlebars setup
app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: path.join(__dirname, 'views/partials'),
    helpers: {
        eq: (a, b) => a === b,
        formatDate: (date) => new Date(date).toLocaleDateString(),
        section: function(name, options) {
            if (!this._sections) this._sections = {};
            this._sections[name] = options.fn(this);
            return null;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function (req, res, next) {
    res.locals.messages = req.flash();
    next();
});

// Screens
app.get('/', home_route_instance.home);

//practice
app.get('/practice', practice);
app.post('/submit', submit);


// app.get('/dashboard', home_route_instance.dashboard);

//test
app.get('/test', test);
app.post('/submit-answer', express.json(), submitAnswer);


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App started on port ${PORT}`);
});