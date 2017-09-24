var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var TeleSignSDK = require('telesignsdk');
var request = require("request")
var cors = require('cors')
const uuidv4 = require('uuid/v4');

var bodyParser = require('body-parser')


app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
// Added by lstigter@tibco.com
var Logger = require('./util/logger');
const httpport = 8000

// Setup Port to Use for Server Communication
server.listen(httpport);



// When displaying index.html, join path.  Basically, look for index.html under public_html/public.
app.use(express.static(path.join(__dirname + '/public')));

app.use(app.router);

app.use(cors());

app.get('/', function (req, res) {
    console.log(__dirname);
    res.sendfile(__dirname + '/public/index.html');
    //return res.send("DATA IS THE NEW BACON");
});

app.get('/ip', function (req, res) {
    return res.send(req.ip);
});


app.post('/sendcontract', function (req, res) {
    var requestBody = {
        "name":"CakeContract",
        "description":"Cake Contract",
        "emailMessage":"This message should be delivered to all signers",
        "autocomplete":true,
        "type":"PACKAGE",
        "visibility":"ACCOUNT",
        "due":null,
        "language":"en",
        "status" : "SENT",
        "roles": [
            {
            "id": "663e0c2d-99ac-4d64-a08f-1b289632aba7",
            "type": "SIGNER",
            "signers": [
                {
                "id": "663e0c2d-99ac-4d64-a08f-1b289632aba7",
                "firstName": "Swami",
                "lastName": "Sundaramurthy",
                "email": "revanth.reddy@gmail.com"
                }
            ],
            "name": "Swami"
            }
        ]
    }
    var options ={
        url: 'https://sandbox.esignlive.com/api/packages/BF1nbylLhpx1sM5W0LQ6NqxS8Vs=/clone',
        headers : {
            'Authorization' : 'Basic MmxtbE1HNmpKTFFHOmtWSFRWV1hCYllVUg==',
            'Resource+Family' : 'userAuthenticationTokens',
            'Content-Type'  : 'application/json'

        },
        body : JSON.stringify(requestBody)
    }

    request.post(options , function(err , resp){
        if(err){
            console.log(err)
            return res.status(500).send("contract seding failed")
        }
        else
            return res.status(200).send("Contracts sent");
    })



    
});

app.post('/sendreminder', function (req, res) {
    const customerId = "9B40B970-164E-4388-8793-EB81AAD03FAB"; // Todo: find in portal.telesign.com
    const apiKey = "mDZbJyQVPaYOKdWlzxWjn9Fo5CygqVQ6HV8b4/QCYYFmtxvu+TMhPGbjf12TuV6diW8hP5H53XVdrn+gTBN7aw=="; // Todo: find in portal.telesign.com
    const rest_endpoint = "https://rest-api.telesign.com"; // Todo: Enterprise customer, change this!
    const timeout = 10 * 1000; // 10 secs



    const client = new TeleSignSDK(customerId,
        apiKey,
        rest_endpoint,
        timeout // optional
        // userAgent
    );
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'weddingcrasher.cpmzubridkml.us-east-1.rds.amazonaws.com',
        user: 'root',
        password: 'test1234',
        database: 'db1'
    });

    connection.connect();

    connection.query('SELECT * from schedule order by created desc limit 1', function (error, results, fields) {
        if (error) {
            return res.status(500).send("Fail");
        }

        const phoneNumber = "15404499765";
        const message = results[0].details;
        const messageType = "ARN";

        console.log("## MessagingClient.message ##");

        function messageCallback(error, responseBody) {
            if (error === null) {
                console.log(`Messaging response for messaging phone number: ${phoneNumber}` +
                    ` => code: ${responseBody['status']['code']}` +
                    `, description: ${responseBody['status']['description']}`);
            } else {
                console.error("Unable to send message. " + error);
            }
        }

        client.sms.message(messageCallback, phoneNumber, message, messageType);
        return res.status(200).send("sms sent");

    });

    connection.end();


});



app.post('/schedule', function (req, res) {
    var text = "random meeting";
    if(req.body.text)
        text = req.body.text
    console.log(text)
    
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var code = '';
  for (var i = 0; i < 5; i++)
    code += possible.charAt(Math.floor(Math.random() * possible.length));

    var requestBody = {
    "@odata.context": "https://progress.the-dataguy.com/api/odata4/Test/$metadata#schedules/$entity",
    "id": code,
    "details" : text,
    "owner_event": "Owen wilson",
    "created": (new Date()).getTime(),
    "status_event": "Incomplete"
    }
    var options ={
        url: 'https://progress.the-dataguy.com/api/odata4/Test/schedules',
        headers : {
            'Authorization' : 'Basic aGRwdXNlcjIzOldlZGRpbmdDcmFzaGVycw==',
            'Content-Type'  : 'application/json'

        },
        body : JSON.stringify(requestBody)
    }

    request.post(options , function(err , resp , body){
        if(err){
            console.log(err)
            return res.status(500).send("scheduling failed")
        }
        else
            console.log(body)
            return res.status(200).send("Scheduling successfull");
    })

});


//schedule list
app.get('/schedule' , cors(),function (req,res){
    // var options ={
    //     url: 'https://progress.the-dataguy.com/api/odata4/Test/schedules?$top=5&$orderby=created',
    //     headers : {
    //         'Authorization' : 'Basic aGRwdXNlcjIzOldlZGRpbmdDcmFzaGVycw==',
    //         'Content-Type'  : 'application/json'

    //     }
    // }

    // request.get(options , function(err , resp , body){
    //     if(err){
    //         console.log(err)
    //         return res.status(500).send("schedule list failed")
    //     }
    //     else
    //         return res.status(200).send(JSON.parse(body).value);
    // })



    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'weddingcrasher.cpmzubridkml.us-east-1.rds.amazonaws.com',
        user: 'root',
        password: 'test1234',
        database: 'db1'
    });

    connection.connect();

    connection.query('SELECT * from schedule order by created desc limit 5', function (error, results, fields) {
        if (error) {
            return res.status(500).send("Fail");
        }
        
        return res.status(200).send(results);
        
    });

    connection.end();
});

app.post('/tellme', function (req, res) {
    
    var ConversationV1 = require('watson-developer-cloud/conversation/v1');
    
    var conversation = new ConversationV1({
    username: '20d98b15-5caf-4b88-8f5c-f5ae05c17560',
    password: 'yMNekZcmAwtZ',
    version_date: ConversationV1.VERSION_DATE_2017_05_26
    });
    
    conversation.message({
    input: { text: req.body.text},
    workspace_id: 'afae70f9-c6df-4eee-b6e7-4a8587b9275b'
    }, function(err, response) {
        if (err) {
        console.error(err);
        } else {
            return res.status(200).send(JSON.stringify(response.output.text));
        }
    });

});


app.post('/likeacake' , function(req , res){
//     var text = "random meeting";
//     if(req.body.text)
//         text = req.body.text
//     console.log(text)
    
//   var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
//   var code = '';
//   for (var i = 0; i < 5; i++)
//     code += possible.charAt(Math.floor(Math.random() * possible.length));

//     var requestBody = {
//     "@odata.context": "https://progress.the-dataguy.com/api/odata4/Test/$metadata#schedules/$entity",
//     "id": code,
//     "details" : text,
//     "owner_event": "Owen wilson",
//     "created": (new Date()).getTime(),
//     "status_event": "Incomplete"
//     }
//     var options ={
//         url: 'https://progress.the-dataguy.com/api/odata4/Test/schedules',
//         headers : {
//             'Authorization' : 'Basic aGRwdXNlcjIzOldlZGRpbmdDcmFzaGVycw==',
//             'Content-Type'  : 'application/json'

//         },
//         body : JSON.stringify(requestBody)
//     }

//     request.post(options , function(err , resp , body){
//         if(err){
//             console.log(err)
//             return res.status(500).send("scheduling failed")
//         }
//         else
//             console.log(body)
//             return res.status(200).send("Scheduling successfull");
//     })
});


app.post('/esigncall' , function(req,res){
    var options = {
        'url' : 'https://hooks.slack.com/services/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',
        'headers' : {
            'Content-type' : 'application/json'
        },
        
        body :  "{\"text\":\"User finished signing the contract\"}"
    }

    request.post(options , function(err , resp , body){
        if(err){
            console.log(err)
            return res.status(500).send("callback failed")
        }
        else
            return res.status(200).send('User signed the contract');
    
    });
});




function getSchedules() {
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'weddingcrasher.cpmzubridkml.us-east-1.rds.amazonaws.com',
        user: 'root',
        password: 'test1234',
        database: 'db1'
    });

    connection.connect();

    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        if (error) throw error;
        console.log('The solution is: ', results[0].solution);
    });

    connection.end();
}