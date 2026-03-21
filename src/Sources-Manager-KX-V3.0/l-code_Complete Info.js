// ;(function(root,factory){
//   root.completeParameters = factory()
// })(this,function(){
  
//   var completeParameters = {};
  
//   var getParametersObj = {
//     primaryClassifierName: getPrimaryClassifierName, 
//     primaryClassifierCode: getPrimaryClassifierCode,
//     secondaryClassifierName: getSecondaryClassifierName, 
//     secondaryClassifierCode: getSecondaryClassifierCode,
//     branch: getBranch,
//     type: function(){ return "GSheet"},
//     headerRow: getHeaderRow,
//     skipRows: getSkipRows,
//     sheetName: copyOverSheetName,
//     ssid: getSSID,
//     formid: getFormUrlFromSheet,
//     bookName: getSheetName,
//     creationDate: getCreationDate,
//     accepting: getAcceptBool,
//     include: getIncludeBool
//   }
  
//   var lastRowG
  
//   var primaryClassifierName, primaryClassifierCode
  
//   function init(gSheetObj,ssid,row,headersIndex,lastRow,manualAutoBool){
//     var fields = Object.keys(getParametersObj);
//     lastRowG = lastRow;
//     fields.forEach(function(field){
//       var col = headersIndex[field];
//       var value = getParametersObj[field](ssid,manualAutoBool,row,col,gSheetObj);
//       if(value){
//         gSheetObj.getRange(row, col).setValue(value);
//       }
//     })
//   }
  
//   function getSSID(ssid){
//     return ssid
//   }
  
//   function copyOverSheetName(ssid,manualAutoBool){
//       if(lastRowG && !manualAutoBool){
//       return lastRowG.sheetName;
//     }
//   }
  
//   function getFormUrlFromSheet(ssid){
//     try{
//       var formURL = SpreadsheetApp.openById(ssid).getFormUrl();
//       var form = FormApp.openByUrl(formURL);
//       var formId = form.getId();
//     }catch(e){
//       return e;
//     }
//     return formId;
//   }
  
//   function getSheetName(ssid){
//     try{
//       var name = SpreadsheetApp.openById(ssid).getName();
//     }catch(e){
//       return e;
//     }
//     return name;
//   }
  
//   function getCreationDate(ssid){
//     try{
//       var cDate =  DriveApp.getFileById(ssid).getDateCreated();
//     }catch(e){
//       return e;
//     }
//     return cDate;
//   }
  
//   function getSSID(ssid){
//     return ssid
//   }
  
//   function getHeaderRow(ssid,manualAutoBool){
//     var headerRow = manualAutoBool? '' : 1;
//     return headerRow;
//   }
  
//   function getSkipRows(ssid,manualAutoBool){
//     var skipRows = manualAutoBool? '' : 0;
//     return skipRows;
//   }
  
//   function getPrimaryClassifierName(){
//     if(!primaryClassifierName){
//       var ui = SpreadsheetApp.getUi();
//       var response = ui.prompt('What is the given name of the event/activity..etc type for which the source is added?', ui.ButtonSet.OK);
//       primaryClassifierName = response.getResponseText()
//     }
//     return primaryClassifierName;
//   }
  
//   function getPrimaryClassifierCode(){
//     if(!primaryClassifierCode){
//       var ui = SpreadsheetApp.getUi();
//       var response = ui.prompt('What is the given code of the event/activity..etc type for which the source is added?', ui.ButtonSet.OK);
//       primaryClassifierCode = response.getResponseText()
//     }
//     return primaryClassifierCode;
//   }
  
//   function getSecondaryClassifierName(){
//     var ui = SpreadsheetApp.getUi();
//     var response = ui.prompt('What is the given name of the specific event for which the source is added?', ui.ButtonSet.OK);
//     return response.getResponseText();
//   }
  
//   function getSecondaryClassifierCode(){
//     var ui = SpreadsheetApp.getUi();
//     var response = ui.prompt('What is the given code of the specific event for which the source is added?', ui.ButtonSet.OK);
//     return response.getResponseText();
//   }
  
//   function getBranch(){
//     if(lastRowG){
//       return lastRowG.branch;
//     }
//     var ui = SpreadsheetApp.getUi();
//     var response = ui.prompt('What is the branch? Confessions, Activity, Event..etc', ui.ButtonSet.OK);
//     return response.getResponseText();
//   }
  
//   function getAcceptBool(){
//     return 'TRUE';
//   }
  
//   function getIncludeBool(ssid,manualAutoBool,row,col,gSheetObj){
//     var checkboxRange = gSheetObj.getRange(row, col);
//     var enforceCheckbox = SpreadsheetApp.newDataValidation();
//     enforceCheckbox.requireCheckbox();
//     enforceCheckbox.setAllowInvalid(true);
//     enforceCheckbox.build();
//     checkboxRange.setDataValidation(enforceCheckbox);
//     return true;
//   }
  
//   completeParameters.init = init;
  
//   return completeParameters
  
// })

// function completeInfo(){
//   completeParameters.init();
// }