//set up the server
const express = require( "express" );
const logger = require("morgan");
const helmet = require("helmet"); //add this
const app = express();
app.use(helmet()); //add this
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

// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.render("index");
} );

// define a route for the stuff inventory page
app.get( "/ads", ( req, res ) => {
    //res.sendFile( __dirname + "/views/ads.html" );
    db.execute('SELECT * FROM ads', (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal server error
        } else {
            res.render('ads', {inventory : results});
        }
    })
} );


const read_item_sql = 'SELECT * FROM ads WHERE ad_id = ?'
// define a route for the item detail page
app.get( "/ads/item/:id", ( req, res ) => {
    // res.sendFile( __dirname + "/views/item.html" );
    db.execute(read_item_sql, [req.params.id] [1], (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal server error
        } else if (results.length == 0) {
            res.status(404).send(`No item found with id = ${req.params.id}`);
        }
        else {
            let data = res.send(results[0]);
            
            res.render('product_name', data)
        }
    })

} );

const delete_item_sql = "DELETE FROM ads WHERE id = ?";
app.get( "/ads/item/:id/delete", ( req, res ) => {
    db.execute(delete_item_sql, [req.params.id], ( err, result ) => {
        if (error) {
            res.status(500).send(error); // Internal server error
        } else {
            res.redirect("/ads");
        }
    })
});
app.post("/stuff", (req, res) => {
    res.send("Thanks for submitting your ad, our website will process it shortly")
})

//did not finish values for this
const post_sql_msg = `INSERT INTO stuff (product_name, quantity) VALUES (?, ?)`
app.post("/sample/url", ( req, res ) => {
     
});

const update_item_sql = `
UPDATE ads
SET
    item = ?, quantity = ?, product_name = ?
WHERE id = ?
`

// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );