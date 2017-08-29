var https = require('https');
var soap = require('soap');
var fs = require('fs');
var util = require('util');

var url = 'https://webservices.netsuite.com/wsdl/v2017_1_0/netsuite.wsdl';

var credentials = {
    "applicationInfo": {
        "applicationId": "736CE7E6-C280-47E3-B348-B2D689F61EB4"
    },
    "passport": {
        "email": "ssantiago@netsuite.com",
        "password": "4321.elcAro",
        "account": "4343793"
    }
};

var headers = {'Authorization': 'NLAuth nlauth_email='+credentials.passport.email+', nlauth_signature='+credentials.passport.password};

var req = https.get({
    "host": "rest.netsuite.com",
    "path": "/rest/roles",
    "headers": headers
}, function(response) {
    var str = ''
    response.on('data', function (chunk) {
      str += chunk;
    });

    response.on('end', function () {
      var accounts = JSON.parse(str);
      for (var i = 0; i < accounts.length; i++) {
          console.log(accounts[i].account.name);
      }
    });
});
req.end();

// soap.createClient(url, function(err, client) {
//     console.log('err1', err);

//     fs.writeFile('mynewfile1.txt', util.inspect(client), function (err) {
//         if (err) throw err;
//         console.log('Saved!');
//     });

//     console.log('client', client);
//     client.addSoapHeader({
//         "applicationInfo": credentials.applicationInfo
//     });
//     client.login({
//         "passport": credentials.passport
//     }, function(err2, result) {
//         console.log('err2', err2);
//         console.log('result', JSON.stringify(result));

//         client.search({

//         });

//     });
// });