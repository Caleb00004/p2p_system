const express = require("express");
const db = require("./config/db");
const dotenv = require("dotenv");
const user = require("./routes/user.routes")
const payment = require("./routes/payment.routes");
const bodyParser = require("body-parser");
const session = require('express-session')
const MongoStore = require('connect-mongo')

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

dotenv.config({ path: "./config/config.env" });

db();

// Body parser
app.use(express.json());

// setting up session.
app.use(session({
    secret: 'secret-key',
    resave: true,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 14 * 24 * 60 * 60,
        autoRemove: 'native'
    })
}))

// creating middleware to log out some details for every request
app.use((req,res,next) => {
    console.log('\nNew Request made: ')
    console.log('Path: ', req.path)
    console.log('Method: ', req.method)        
    next()
})


app.get('/', (req,res) => {
    res.send('Its working')
})

// routes
app.use("/api/projectCleanEarth/pay", payment);
app.use("/user", user)
 
// To handle errors
app.use((err, req, res, next) => {
    console.log("ERROR HANDLER")
    console.log(err)
    res.status(err.status || 500)
    res.json({
        message: err.message,
        error: {}
    })
})

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`server starting on port: ${port}`);
});
