// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
var soap = require('soap');

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

        // var credentials = {
        //     "email": '',
        //     "password": ''
        // };       

        // askEmail(credentials);

        const config = vscode.workspace.getConfiguration("suitecode");
        const credentials = config.get("credentials");

        var url = 'https://webservices.netsuite.com/wsdl/v2016_1_0/netsuite.wsdl';
        var args = {
            "applicationInfo": credentials.applicationInfo,
            "passport": {
                "email": credentials.email,
                "password": credentials.password,
                "account": credentials.account
            }
        };

        soap.createClient(url, function(err, client) {
            console.log('err1', err);
            console.log('client', client);
            client.login(args, function(err2, result) {
                console.log('err2', err2);
                console.log('result', result);
            });
        });



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
        vscode.window.showInformationMessage(credentials.email +': '+ credentials.password);
        var config = vscode.workspace.getConfiguration("suitecode", ".");
        config.update("email", credentials.email, vscode.ConfigurationTarget.WorkspaceFolder);
        // console.log(config);
    }); 

}

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;