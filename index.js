var express = require('express');
var app = express();
var server = require('http').createServer(app);
var path = require('path');
var TeleSignSDK = require('telesignsdk');
var request = require("request")

var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
// Added by lstigter@tibco.com
var Logger = require('./util/logger');
const httpport = 8000

// Setup Port to Use for Server Communication
server.listen(httpport);
// Parses RESTful body content to determine XML/JSON/other formats
//app.use(express.bodyParser());

// Not sure. Research
// app.use(express.methodOverride());



// When displaying index.html, join path.  Basically, look for index.html under public_html/public.
app.use(express.static(path.join(__dirname + '/public')));

app.use(app.router);

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
    const timeout = 10*1000; // 10 secs

    const client = new TeleSignSDK( customerId,
        apiKey,
        rest_endpoint,
        timeout // optional
        // userAgent
    );

    const phoneNumber = "15404499765";
    const message = "You're scheduled for a dentist appointment at 2:30PM.";
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



app.post('/schedule', function (req, res) {
    console.log(req.body.text)
    return res.status(200).send("Meeting scheduled");
});


app.post('/tellme', function (req, res) {
    
    var ConversationV1 = require('watson-developer-cloud/conversation/v1');
    
    var conversation = new ConversationV1({
    username: 'cacf5340-cd2d-4bae-9aee-c5375c3c7101',
    password: '3FDpgrE0zvie',
    version_date: ConversationV1.VERSION_DATE_2017_05_26
    });
    
    conversation.message({
    input: { text: req.body.text},
    workspace_id: '22e2cd9b-0b72-4760-9c33-1bd871a3797a'
    }, function(err, response) {
        if (err) {
        console.error(err);
        } else {
            return res.status(200).send(JSON.stringify(response.output.text));
        }
    });

});