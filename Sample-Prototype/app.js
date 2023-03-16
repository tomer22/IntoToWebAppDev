//set up the server

//App does not work yet as deployed, need to get hostdomain link for that (from railway)
const express = require( "express" );
const logger = require("morgan");
const helmet = require("helmet"); //add this
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
const dotenv = require('dotenv');
dotenv.config();
const app = express();

app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'cdnjs.cloudflare.com'],
      }
    }
  })); 

const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: process.env.AUTH0_BASE_URL,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
  };

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

const port = process.env.PORT || 8090;
const db = require('./db/db_pool');
//configure express to use EJS
app.set("views", __dirname + "/views");
app.set("view engine", "ejs")

// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );


// define middleware that logs all incoming requests
app.use(logger("dev"));

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next();
})

app.get('/profile', requiresAuth(), (req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});

// req.isAuthenticated is provided from the auth router
app.get('/authtest', (req, res) => {
  res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});

// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.render("index", {isLoggedIn: req.oidc.isAuthenticated(), user: req.oidc.user});
} );

// define a route for the stuff inventory page
app.get( "/ads", requiresAuth(), ( req, res ) => {
    //res.sendFile( __dirname + "/views/ads.html" );
    db.execute('SELECT * FROM ads WHERE userid = ?', [req.oidc.user.email], (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal server error
        } else {
            res.render('ads', {inventory : results});
        }
    })
} );


const read_item_sql = `SELECT * FROM ads WHERE ad_id = ? AND userid = ?`
// define a route for the item detail page
app.get( "/ads/item/:id", requiresAuth(), ( req, res ) => {
    // res.sendFile( __dirname + "/views/item.html" );
    db.execute(read_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal server error
        } else if (results.length == 0) {
            res.status(404).send(`No item found with id = ${req.params.id}`);
        }
        else {
            let data = results[0];
            console.log(data);
            res.render('item', data)
        }
    })

} );

const delete_item_sql = "DELETE FROM ads WHERE ad_id = ? AND userid = ?";
app.get( "/ads/item/:id/delete", requiresAuth(), ( req, res ) => {
    db.execute(delete_item_sql, [req.params.id, req.oidc.user.email], ( error, result ) => {
        if (error) {
            res.status(500).send(error); // Internal server error
        } else {
            res.redirect("/ads");
        }
    })
});

//I didn't make the post function complete yet because my vision for the website is a bit different than what this post does (I wanted the website to take in the user's input and run some script on it and then post its own output and add to the website with its "Feedback" or return based on the input)
//My website will format the request to the AI generator and will post an output based on what the AI engine says
const post_item_sql = `INSERT INTO ads
(product_name, read_time, userid)
VALUES
(?, ?, ?)`
app.post("/ads", requiresAuth(), (req, res) => {
    // console.log(req.body)
    let read_time = req.body.name.length + req.body.problem.length + req.body.details.length + req.body.points.length
    /*res.send("Thanks for submitting your ad, our website will process it shortly")*/
    db.execute(post_item_sql, [req.body.name, read_time, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            //results.insertId has the primary key (id) of the newly inserted element.
            res.redirect(`/ads/item/${results.insertId}`);
        }
    });
})

//This also I will update later when we learn a way to process user input and post that change to the website (for now I am doing a sample that doensn't quite work as it should)
const update_item_sql = `
UPDATE ads
SET
    feedback = ?, ad_rating = ?, product_name = ?
WHERE ad_id = ?
AND userid = ?
`
app.post("/ads/item/:id", requiresAuth(), ( req, res ) => {
    db.execute(update_item_sql, [req.body.feedback, req.body.ad_rating, req.body.name, req.params.id, req.oidc.user.email], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect(`/ads/item/${req.params.id}`);
        }
    });
})

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );