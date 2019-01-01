const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const path = require('path');
const expressValidator = require('express-validator');
const PORT = process.env.PORT || 80;
const routes = require('./routes');

const cookieParser = require('cookie-parser');
const session = require('express-session');
const expressip = require('express-ip')


const app = express();

// View engine setup
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// Static folder
app.use('/public', express.static(path.join(__dirname, 'public')));

// Body Parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cookieParser());
app.use(session({ secret: 'krunal', saveUninitialized: false, resave: false }));
app.use(expressip().getIpInfoMiddleware);

// Routes from router
app.use('/', routes);
app.use('/gallery', routes);
app.use('/about', routes);

app.listen(PORT, () => console.log('Server started...'));