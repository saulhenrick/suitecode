// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var soap = require('soap');
var https = require('https');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    // console.log('Congratulations, your extension "suitecode" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposable = vscode.commands.registerCommand('extension.setupProject', function () {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        // vscode.window.showInformationMessage('Hello World!');

        const config = vscode.workspace.getConfiguration("suitecode");
        var credentials = {
            "email": config.get('email') || '',
            "password": config.get('passowrd') || '',
            "account": config.get('account') || '',
            "fileCabinetDir": config.get('fileCabinetDir') || '',
            "applicationInfo": {
                "applicationId": "736CE7E6-C280-47E3-B348-B2D689F61EB4"
            }
        };

        const wsdlURL = 'https://webservices.netsuite.com/wsdl/v2017_1_0/netsuite.wsdl';

        vscode.window.showInputBox({
            "placeHolder": '@netsuite.com',
            "prompt": 'Enter your login email address'
        }).then(val => {

            credentials.email = val;

            vscode.window.showInputBox({
                "prompt": 'Enter your login password',
                "password": true
            }).then(val => {

                credentials.password = val;
                config.update("passport", credentials);

                var headers = {'Authorization': 'NLAuth nlauth_email='+credentials.email+', nlauth_signature='+credentials.password};
                var req = https.get({
                    "host": "rest.netsuite.com",
                    "path": "/rest/roles",
                    "headers": headers
                }, function (response) {
                    var str = ''
                    response.on('data', function (chunk) {
                        str += chunk;
                    });
            
                    response.on('end', function () {
                        var accounts = JSON.parse(str);
                        // console.log('accounts', accounts);

                        var quickPickValues = [];
                        accounts.forEach(function(val) {
                            quickPickValues.push({
                                "description": val.account.name,
                                "label": val.account.internalId,
                                "detail": val.role.name
                            });
                        });


                        vscode.window.showQuickPick(quickPickValues, {
                            "matchOnDescription": true
                        }).then(val => {

                            credentials.account = val.label;
                            config.update("passport", credentials);

                            soap.createClient(wsdlURL, function(err, client) {
                                
                                if (err) {
                                    throw err;
                                }

                                console.log(client.describe());

                                client.addSoapHeader({
                                    "applicationInfo": credentials.applicationInfo
                                });
                                client.login({
                                    "passport": {
                                        "email": credentials.email,
                                        "password": credentials.password,
                                        "account": credentials.account
                                    }
                                }, function(err2, result) {
                                    console.log('err2', err2);

                                    client.search({
                                        "folderSearch": "Bundle"
                                    }, function(err3, result) {
                                        console.log('err3', err3);
                                        console.log('result', result);
                                    });

                                });
                            });



                        });
                        
                    });
                });
                req.end();


            });

            
        });
        






















        // const config = vscode.workspace.getConfiguration("suitecode");
        // const credentials = config.get("credentials");

        // var url = 'https://webservices.netsuite.com/wsdl/v2016_1_0/netsuite.wsdl';
        // var args = {
        //     "applicationInfo": credentials.applicationInfo,
        //     "passport": {
        //         "email": credentials.email,
        //         "password": credentials.password,
        //         "account": credentials.account
        //     }
        // };

        // soap.createClient(url, function(err, client) {
        //     console.log('err1', err);
        //     console.log('client', client);
        //     client.login(args, function(err2, result) {
        //         console.log('err2', err2);
        //         console.log('result', result);
        //     });
        // });



        // vscode.window.showInputBox({
        //     password: true
        // }).then(
        //     val => vscode.window.showInformationMessage('Your password was ' + val)
        // );

        // vscode.window.showInformationMessage(nsEmail);

        // var nsPass = vscode.window.showInputBox({
        //     password: true
        // });

    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;


/**
 * Get list of NetSuite accounts by email
 * 
 * @param {Object} passport The passport object
 */
function getAccountList(passport) {
    var headers = {'Authorization': 'NLAuth nlauth_email='+passport.email+', nlauth_signature='+passport.password};
    var req = https.get({
        "host": "rest.netsuite.com",
        "path": "/rest/roles",
        "headers": headers
    }, function (response) {
        var str = ''
        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            var accounts = JSON.parse(str);
            for (var i = 0; i < accounts.length; i++) {
                console.log(accounts[i].account);
            }
        });
    });
    req.end();

}


/**
 * Show email InputBox
 *
 * @param {Object} credentials JSON Object containing credentials
 */
function askEmail(credentials) {

    vscode.window.showInputBox({
        "placeHolder": '@netsuite.com',
        "prompt": 'Enter your login email address'
    }).then(val => {
        credentials.email = val;
        askPassword(credentials);
    });

}


/**
 * Show password InputBox
 *
 * @param {Object} credentials JSON Object containing credentials
 */
function askPassword(credentials) {

    vscode.window.showInputBox({
        "prompt": 'Enter your login password',
        "password": true
    }).then(val => {
        credentials.password = val;
        vscode.window.showInformationMessage(credentials.email + ': ' + credentials.password);
        setSettings({
            "passport": credentials
        });
    });

}


/**
 * Set workspace folder settings
 * @param {Object} newSettings array of settings to update
 */
function setSettings(newSettings) {
    const config = vscode.workspace.getConfiguration("suitecode");
    Object.keys(newSettings).forEach(function (key) {
        console.log(key, newSettings[key]);
        config.update(key, newSettings[key]);
    });
}


// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;