var request = require("request")

var options = {
        'url' : 'https://hooks.slack.com/services/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',
        'headers' : {
            'Content-type' : 'application/json'
        },
        
        // json : JSON.stringify({data : "User finished signing the contract"})
        body :  "{\"text\":\"User finished signing the contract\"}"
    }


    "{\"text\":\"data\"}"

    request.post(options , function(err , resp , body){
        console.log(err)
        console.log(body)
    
    });