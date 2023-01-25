// (Re)Sets up the database, including a little bit of sample data
const db = require("./db_connection");

/**** Delete existing table, if any ****/

const drop_ads_table_sql = "DROP TABLE IF EXISTS `ads`;"

db.execute(drop_ads_table_sql);

/**** Create "stuff" table (again)  ****/

//In the future I'm going to add an "ad" property which is the actual ad the bot creates or the user enters, but not yet
const create_ads_table_sql = `
    CREATE TABLE ads (
        ad_id INT NOT NULL AUTO_INCREMENT,
        product_name VARCHAR(150) NOT NULL,
        ad_rating INT NULL,
        read_time INT NULL,
        feedback VARCHAR(100) NULL,
        PRIMARY KEY (ad_id)
    );
`
db.execute(create_ads_table_sql);

const insert_ads_table_sql = `
    INSERT INTO ads 
        (product_name, ad_rating, read_time, feedback) 
    VALUES 
        (?, ?, ?, ?);
`
db.execute(insert_ads_table_sql, ['Instacure100',	'78',	'32', null]);

db.execute(insert_ads_table_sql, ['SoundBlock',	'99',	'30', "Your ad and product are a killer combination! Your product will be in high demand when it's released to the market I'm sure!"]);

db.execute(insert_ads_table_sql, ['AlgoFly',	'86',	'27', null]);

db.execute(insert_ads_table_sql, ['EZBag',	'94',	'22', null]);
