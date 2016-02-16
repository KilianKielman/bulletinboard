// Requires
var jade = require('jade'); // requires the jade module
var bodyParser = require('body-parser'); // requires the bodyParser module (to be able to get data from a form)
var express = require('express'); // requires the express module (servermodule)
var pg = require('pg'); // requires the postgres module (database)


// Set the connectionString variable
var connectionString = 'postgres://' + process.env.POSTGRES_USER + ':' + process.env.POSTGRES_PASSWORD + '@localhost/bulletinboard';

// Start express and set settings
var app = express(); // sets app equal to calling the express module

app.use(bodyParser.urlencoded({ // this makes the bodyparser function available to the express server
	extended: true
}));

app.set('view engine', 'jade');
app.set('views', 'src/views');

// RENDERS FORM FOR POSTING MESSAGES

app.get('/', function(req, res) {
	res.render('postmessage');
});

app.get('/postedmessages', function(request, response) {
	pg.connect(connectionString, function(err, client, done) {
		client.query('select * from messages', function(err, result) {
			if (err) {
				throw err
			};
			allMessages = result.rows; // Define allMessages
			allMessages = allMessages.reverse(); // Reverse so latest message is on top
			response.render('postedmessages', {
				allMessages: allMessages
			}); // Render postedmessages.jade with variable allMessages passed on
			done(); // Tell the database client that it's done
			pg.end();
		});
	});
});

app.post('/', function(request, response) {
	queryString = 'insert into messages (title, body) values (' + '\'' + request.body.messageTitle + '\',\'' + request.body.messageBody + '\'' + ');';

	pg.connect(connectionString, function(err, client, done) { // Connect to the database
		client.query(queryString, function(err) {
			if (err) {
				throw err;
			}; // Error handler
			response.redirect('/postedmessages'); // After doing the query, redirect to /messages
			done(); // Tell the database client that it's done
			pg.end(); // End the database connection
		});
	});
});

app.listen(3000, function() {
	console.log('Example app listening on port 3000!');
});