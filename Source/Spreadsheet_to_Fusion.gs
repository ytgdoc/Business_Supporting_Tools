// Add the table ID of the fusion table here
var tableIDFusion = '1oyzB3LYqjEzV3uRmkC7uCI92mNrKEP_8bvdnLxw';
 
// key needed for fusion tables api
var fusionTablesAPIKey = 'AIzaSyBwwIy6cjgaVpTEMEe8eZowO0S7CuqODE0'; 
 
// the name of the range used in the program
var rangeName = 'updateFusion';
 
// create menu buttons
function onOpen() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var menuEntries = [{
        name: "Change Range of Data to be Sent (Include Headers)",
        functionName: "setRangeFusion"
    }, {
    	name: "Update Fusion Table",
    	functionName: "updateFusion"
    }, {
    	name: "Change Email Information",
    	functionName: "fixEmail"
    }];
    ss.addMenu("Data Update Functions", menuEntries);
};
 
// main function
function updateFusion() {
    
    // gets the user property 'email' out of project properties
    var email = UserProperties.getProperty('email');
    
    // gets the user property 'password' out of project properties
    var password = UserProperties.getProperty('password');
    
    // if either email or password is not saved in project properties this will store them there
    
    if (email === null || password === null) {
        
        // browser box to input email
        email = Browser.inputBox('Enter email');
        password = Browser.inputBox('Enter password');
        UserProperties.setProperty('email', email);
        UserProperties.setProperty('password', password);
    } else {
        email = UserProperties.getProperty('email');
        password = UserProperties.getProperty('password');
    }
	
	var authToken = getGAauthenticationToken(email, password);
	var updateMsg = updateData(authToken, tableIDFusion);
};
 
// Google Authentication API this is taken directly from the google fusion api website
function getGAauthenticationToken(email, password) {
    password = encodeURIComponent(password);
    var response = UrlFetchApp.fetch("https://www.google.com/accounts/ClientLogin", {
        method: "post",
        payload: "accountType=GOOGLE&Email=" + email + "&Passwd=" + password + "&service=fusiontables&Source=testing"
    });
 
	var responseStr = response.getContentText();
	responseStr = responseStr.slice(responseStr.search("Auth=") + 5, responseStr.length);
	responseStr = responseStr.replace(/\n/g, "");
	return responseStr;
};
 
// query fusion API post
function queryFusionTables(authToken, query) 
{
 
    // location to send the infomation to
    var prefix = "https://www.googleapis.com/fusiontables/v1/query?key=";
    var suffix = fusionTablesAPIKey + '&';
    var URL = prefix + suffix;
      
    // sends the the authentication and the query in url format
    var response = UrlFetchApp.fetch(URL, {
        method: "post",
        headers: {
            "Authorization": "GoogleLogin auth=" + authToken,
        },
        payload: "sql=" + query
    });
    
    return response.getContentText();
};
 
// delete old data in fusion table
function deleteData(authToken, tableID) {
    var query = encodeURIComponent("DELETE FROM " + tableID);
    return queryFusionTables(authToken, query);
};
 
// puts all the current information in the spreadsheet into a query
function updateData(authToken, tableID) {
    
    //find sheets with ranges that will be sent
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var range = ss.getRangeByName(rangeName);
    var data = range.getValues();
    //var data = ss.getLastRow();
    
    // format data
    for (var i in data) {
        for (var j in data[i]) {
            if (isNaN(data[i][j])&& typeof(data[i][j])!="object") {
                data[i][j] = data[i][j].replace(/'/g, "\\'");
            }
            var test = typeof(data[i][j]); 
            if (typeof(data[i][j])=="object" && j!=0)
              data[i][j]= dateToYMD(data[i][j]);
			if (typeof(data[i][j])=="object" && j==0)
				data[i][j]= ''+data[i][j]+'';
        }
    }
 
	var headers = data[0];
	var queryPrepend = "INSERT INTO " + tableID + " (" +"\'" + headers.join("\',\'") + "\'" + ") VALUES ('";
    //var queryPrepend = "INSERT INTO " + tableID + " (" +"\'" + "\'" + ") VALUES ('";
	var query = "";
    var indexLast = ss.getLastRow();
	
   query += queryPrepend + data[indexLast-1].join("','") + "'); ";
    
	return queryFusionTables(authToken, encodeURIComponent(query));
};
 
// change email if needed
function fixEmail() {
    var decision = Browser.msgBox("WARNING", "Are you sure you want to change your email?", Browser.Buttons.YES_NO);
    if (decision == 'yes') {
        var email = Browser.inputBox('Enter email');
        var password = Browser.inputBox('Enter password');
		UserProperties.setProperty('email', email);
		UserProperties.setProperty('password', password);
	}
};
 
// set range
function setRangeFusion() {
    var decision = Browser.msgBox("WARNING", "Are you sure you want to change the Update Fusion Range?", Browser.Buttons.YES_NO);
    if (decision == 'yes') {
        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var check = ss.getRangeByName(rangeName)
            if (check != null) {
                ss.removeNamedRange(rangeName);
            }
		var range = SpreadsheetApp.getActiveRange()
		ss.setNamedRange(rangeName, range);
		Browser.msgBox("WARNING", "The range \'" + rangeName + "\' used to send data to Fusion has been changed.", Browser.Buttons.OK);
	}
};
function dateToYMD(date) {
    var d = date.getDate();
    var m = date.getMonth() + 1;
    var y = date.getFullYear();
    return ''+y + '-'  + (m<=9 ? '0' + m : m) + '-'+ (d <= 9 ? '0' + d : d)  ;
}