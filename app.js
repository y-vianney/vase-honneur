const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const indexRouter = require('./routes/index');
const apiRouter = require('./routes/api');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public', 'views'));

// Liste des origines autorisées :
const allowedOrigins = [
    `http://localhost:${process.env.PORT || 3000}`,
    'https://vase-honneur.onrender.com',
    'https://vase-honneur.vercel.app',
];

const corsOptions = {
    // Si l'origine de la requête est dans la liste, on l'autorise.
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cors({ origin: '*' }));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Servir les fichiers statiques (HTML, CSS, JS du frontend)
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/', indexRouter);
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
const errorHandler = (err, req, res, next) =>  {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // Pour une API, on renvoie du JSON en cas d'erreur, pas une vue HTML
    res.status(err.status || 500);
    res.json({ error: err.message });
}
app.use(errorHandler);

module.exports = app;