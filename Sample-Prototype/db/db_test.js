const db = require("./db_connection");

/**** Read the sample items inserted ****/

const read_ads_table_sql = "SELECT * FROM ads";

db.execute(read_ads_table_sql, 
    (error, results) => {
        if (error) 
            throw error;

        console.log("Table 'ads' initialized with:")
        console.log(results);
    }
);

db.end();