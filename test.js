var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'weddingcrasher.cpmzubridkml.us-east-1.rds.amazonaws.com',
        user: 'root',
        password: 'test1234',
        database: 'db1'
    });

    connection.connect();

    connection.query('SELECT * from schedule order by created desc limit 5', function (error, results, fields) {
        if (error) throw error;
        
        results.forEach(function(result) {
            console.log(result.id);
        });
    });

    connection.end();