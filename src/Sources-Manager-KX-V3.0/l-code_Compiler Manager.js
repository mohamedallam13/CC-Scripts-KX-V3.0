// ;(function(root,factory){
//   root.compilerManager = factory()
// })(this,function(){
  
//   var compilerManager = {};
  
//   const MASTER_INDEX_FILE_ID = "18v8jqGGsu3PYmLWkFH0tFVSqhQzMJfsn";
//   const ALL_FILES_IDS = Utils.getJSONData(MASTER_INDEX_FILE_ID);
//   const GSHEETS_SOURCES_LIST_FILE = ALL_FILES_IDS.gSheetsSourcesFileId;
  
//   const SSID //= '1WlmtOujEpnm3TsBSDNAnIg3Ppo1fy1EkEc8ycRS_Lzo';
  
//   var activeSheet = SpreadsheetApp.getActive();
//   var ssid = activeSheet.getId() || SSID;
//   var gSheetObj = activeSheet.getActiveSheet();
//   var currSheetName = gSheetObj.getSheetName();
//   var columnSections
  
//   var compilerOptionsArr = [
//     {
//       tableName: "sources",
//       headerRow: 1,
//       skipRows: 0,
//       invert: false
//     },
//     {
//       tableName: "maps",
//       headerRow: 1,
//       skipRows: 0,
//       invert: true
//     }
//   ]

//   var sourcesList = Utils.getJSONData(GSHEETS_SOURCES_LIST_FILE);
//   var subTables = getSubTables(currSheetName);
  
//   function getSubTables(sheetN){
//     var check = checkSheetInList();
//     if(check){
//       var subTablesData = getAllDataInSheet(sheetN);
//       var subTables =  subTablesData.map(getTables);
//       return Toolkit.indexObjArrBy(subTables,"tableName");
//     }else{
//       generateUIMessage("Sheet not in list","Please add sheet to the sources first!")
//     }
//   }
  
//   function getAllDataInSheet(sheetN){
//     sheetN = sheetN || currSheetName;
//     var sheet = SpreadsheetApp.openById(ssid).getSheetByName(sheetN);
//     var allSheetData = sheet.getDataRange().getValues();
//     var subTablesDataAgg = Toolkit.splitArr(allSheetData,'');
//     columnSections = subTablesDataAgg.partionsArr;
//     return subTablesDataAgg.datasArr;
//   }
  
//   function getTables(dataTable,i){
//     var options = compilerOptionsArr[i];
//     options.startCol = i == 0? 1 : columnSections[i - 1] + 2;
//     if(options.invert){
//       dataTable = Toolkit.invertArray(dataTable);
//     }
//     var tableData = Toolkit.objectifyArray(dataTable,undefined,options);
//     tableData.options = options;
//     return  tableData
//   }
  
//   function checkSheetInList(){
//     if(sourcesList.indexOf(currSheetName) != -1){
//       return true;
//     }
//     return false;
//   }
  
//   //////////////////////////////////////////// MAIN FUNCTIONS
  
//   function addNewSource(manualAutoBool){
//     if(subTables){
//       var subTable = subTables["sources"];
//       subTable.entriesDataObjArr.forEach(function(row,i,allRows){
//         var lastRow 
//         if(i>0){
//           lastRow = allRows[i-1];
//         }
//         if(row["activated"] != "YES"){
//           var ssid = addListOfSheetsMenu(row,row.entryIndexInSheet,subTable.headerIndexesObj.sheetName);
//           completeParameters.init(gSheetObj,ssid,row.entryIndexInSheet,subTable.headerIndexesObj,lastRow,manualAutoBool);
//         }
//       })
//     }
//   }
  
//   function addSourceHeaders(){
//     if(subTables){
//       var warningsArr = [];
//       var sourcesTable = subTables["sources"];
//       var STheaderIndexes = sourcesTable.headerIndexesObj;
//       var sourceTableData = sourcesTable.entriesDataObjArr;
//       sourceTableData.forEach(function(row){
//         if(row.sheetName === '' || row.headerRow === '' || row.skipRows === ''){
//           warningsArr.push(row["#"]);
//         }else{
//           populateValidationsInMap(row)
//         }
//       })
//       if(warningsArr.length != 0){
//         var message = 'Please complete the information for sources:\n';
//         popoutErrorMessges(message,warningsArr);
//       }
//     }
//   }
  
//   function activateSources(){
//     if(subTables){
//       var table = subTables["sources"];
//       var headerIndexes = table.headerIndexesObj;
//       var tableData = table.entriesDataObjArr;
//       tableData.forEach(function(row){
//         if(row.activated == ''){
//           confirmActivation(row,headerIndexes);
//         }
//       })
//     }
//   }
  
//   function copyMapOverLastSource(){
//     if(subTables){
//       var numberOfSources = subTables.sources.entriesDataObjArr.length;
//       if(numberOfSources > 1){
//         mapsIndexedSourceNum = getMapsIndex();
//         var sourceNum = numberOfSources - 1;
//         var map = mapsIndexedSourceNum[sourceNum];
//         if(map){
//           writeToThisMapColumn(map)
//         }
//       }
//     }
//   }
  
// //  function constructSourcesFileAlt(){
// //    sourcesList.forEach(function(sourceName,i){
// //      var writeFlag = i == sourcesList.length - 1? true : false;
// //      subTables = getSubTables(sourceName);
// //      sourcesFileContruction.init(ALL_FILES_IDS,sourceName,subTables,writeFlag)
// //    })
// //  }
  
//   function constructSourcesFile(){
//     var subTablesObj = {};
//     sourcesList.forEach(function(sourceName){
//       subTablesObj[sourceName] = getSubTables(sourceName);
//     })
//     sourcesFileContruction.init(ALL_FILES_IDS,subTablesObj)
//   }
  
//   function clearSources(){
//     var response = Browser.msgBox('Clear All Sources', 'Are you sure you want to clear all sources? Counter data will be lost.', Browser.Buttons.YES_NO);
//     if (response == "yes") {
//       Logger.log('The user clicked "Yes."');
//       var sourceFilesIdArr = [ALL_FILES_IDS.sourcesIndexedFileId,ALL_FILES_IDS.sourcesUnpackedFileId];
//       sourceFilesIdArr.forEach(function(fileId){
//         Toolkit.writeToJSON({},fileId);
//       })
//     }
//   }
  
//   function addRemoveSources(){
//     var index = sourcesList.indexOf(currSheetName);
//     if(index == -1){
//       sourcesList.push(currSheetName);
//       Toolkit.writeToJSON(sourcesList,GSHEETS_SOURCES_LIST_FILE)
//       generateUIMessage("Source Added!","The source sheet has been added to the list of sources.");
//     }else{
//       sourcesList.splice(index, 1);
//       Toolkit.writeToJSON(sourcesList,GSHEETS_SOURCES_LIST_FILE);
//       generateUIMessage("Source Removed!","The source sheet has been removed from the list of sources.");
//     }
//     SpreadsheetApp.flush()
//   }
  
//   //////////////////////////////////////// SUB FUNCTIONS
   
//   function addListOfSheetsMenu(rowData,row,col){
//     var sheet = SpreadsheetApp.openByUrl(rowData.URL);
//     var sheetNames = sheet.getSheets().map(function(sheetObj){
//       return sheetObj.getName();
//     });
//     Toolkit.setValidationList(gSheetObj,sheetNames,row,col);
//     return sheet.getId();
//   }  
  
//   function confirmActivation(row,headerIndexes){
//     var response = Browser.msgBox('Activate Source', 'Are you sure all headers have been added correctly?', Browser.Buttons.YES_NO);
//     if (response == "yes") {
//       stampYes(row,headerIndexes)
//       Logger.log('The user clicked "Yes."');
//     } else {
//       Logger.log('The user clicked "No" or the dialog\'s close button.');
      
//     }
//   }
  
//   function populateValidationsInMap(row){
//     var mapsTable = getMapsTable();
//     if(mapsTable){
//       var headers = getHeaders(row);
//       var sourceNum = row["#"];
//       var mapsIndexedSourceNum =  Toolkit.indexObjArrBy(mapsTable.entriesDataObjArr,"Base_Source");
//       var startRow = mapsTable.options.headerRow + mapsTable.options.skipRows + 1;
//       var col = mapsIndexedSourceNum[sourceNum]? mapsIndexedSourceNum[sourceNum].entryIndexInSheet : null;
//       var rows = Object.keys(mapsTable.headerIndexesObj).length - 1;
//       if(!mapsIndexedSourceNum[sourceNum]){
//         col = addExtraColToMaps(mapsTable,sourceNum);
//       }
//       gSheetObj.getRange(mapsTable.options.headerRow,col).setValue(sourceNum);
//       Toolkit.setValidationList(gSheetObj,headers,startRow,col,rows,1);
//     }
//   }
  
//   function addExtraColToMaps(mapsTable,sourceNum){
//     var col = parseInt(mapsTable.options.startCol) + (parseInt(sourceNum) - 1);
//     gSheetObj.insertColumnAfter(col);
//     mapsTable.entriesDataObjArr.forEach(function(row){
//       if(row.entryIndexInSheet >= col){
//         row.entryIndexInSheet +=1;
//       }
//     })
//     return col + 1;
//   }
  
//   function getMapsTable(){
//   //needs more work in case the maps are not initiated
//     return subTables["maps"];
//   }
  
//   function getMapsIndex(){
//     var mapsTable = getMapsTable();
//     var mapsIndexedSourceNum =  Toolkit.indexObjArrBy(mapsTable.entriesDataObjArr,"Base_Source");
//     return mapsIndexedSourceNum;
//   }
  
//   function writeToThisMapColumn(map){
//     var mapsTable = getMapsTable();
//     var startRow = mapsTable.options.headerRow + mapsTable.options.skipRows + 1;
//     var col = mapsIndexedSourceNum[sourceNum].entryIndexInSheet;
//     var writeArr = Toolkit.objArrToArray(map,undefined,true);
//     var range = gSheetObj.getRange(startRow, col,writeArr.length,1).setValues(writeArr);
//   }
  
//   function stampYes(row,headerIndexes){
//     var rowNum = row.entryIndexInSheet;
//     var col = headerIndexes.activated;
//     gSheetObj.getRange(rowNum, col).setValue("YES");
//   }
  
//   function getHeaders(row){
//     var sheet = SpreadsheetApp.openById(row.ssid).getSheetByName(row.sheetName);
//     var headers = sheet.getRange(row.headerRow, 1,1,sheet.getLastColumn()).getValues()[0]
//     headers = headers.filter(function(header){
//       return header != "";
//     })
//     return headers;
//   }
  
//   function popoutErrorMessges(message,warningsArr){
//     var message = message + warningsArr.join();
//     generateUIMessage('Please Complete Info!',message);
//   }
  
//   function generateUIMessage(title,message){
//     var ui = SpreadsheetApp.getUi(); // Same variations.
//     var result = ui.alert(
//       title,
//       message,
//       ui.ButtonSet.OK);
//   }
  
//   compilerManager.addNewSource = addNewSource;
//   compilerManager.addSourceHeaders = addSourceHeaders;
//   compilerManager.activateSources = activateSources;
//   compilerManager.addRemoveSources = addRemoveSources;
//   compilerManager.constructSourcesFile = constructSourcesFile;
//   compilerManager.clearSources = clearSources;
  
//   return compilerManager
  
// })

// function addNewSourceAuto(){
//   compilerManager.addNewSource(false);
// }

// function addNewSourceManual(){
//   compilerManager.addNewSource(true);
// }

// function addSourceHeaders(){
//   compilerManager.addSourceHeaders();
// }

// function activateSources(){
//   compilerManager.activateSources();
// }

// function addRemoveSourcesSection(){
//   compilerManager.addRemoveSources();
// }

// function clearSources(){
//   compilerManager.clearSources();
// }

// function createSourcesFile(){
//   compilerManager.constructSourcesFile();
// }
