// ;(function(root,factory){
//   root.sourcesFileContruction = factory()
// })(this,function(){
  
//   var sourcesFileContruction = {};
  
//   const SOURCES_INDEX_FILE_ID = "1KYrju7TNNTJKO29IXAMPX5sJ-_uuQyDZ";
  
//   var sourcesObj
//   var sourcesIndex = Utils.getJSONData(SOURCES_INDEX_FILE_ID);
//   var branch
  
//   function init(ALL_FILES_IDS,subTablesObj){
//     createUnpackedSourcesFile(ALL_FILES_IDS,subTablesObj)
//     createIndexedSourcesFile(ALL_FILES_IDS,subTablesObj)
//   }
  
//   function createUnpackedSourcesFile(ALL_FILES_IDS,subTablesObj){
//     var sourcesUnpackedFileId = ALL_FILES_IDS.sourcesUnpackedFileId;
//     sourcesObj = Toolkit.readFromJSON(sourcesUnpackedFileId);
//     Object.keys(subTablesObj).forEach(function(sourceName){
//       var subTables = subTablesObj[sourceName];
//       var sourceObjArr = formUnpackedSourcesObject(sourceName,subTables);
//       sourcesObj[sourceName] = sourceObjArr;
//     })
//     Toolkit.writeToJSON(sourcesObj,sourcesUnpackedFileId);
//   }
  
//   function formUnpackedSourcesObject(sourceName,subTables){
//     var sourcesTable = subTables["sources"].entriesDataObjArr;
//     var mapsTable = subTables["maps"].entriesDataObjArr;
//     var mapsIndexedSourceNum =  Toolkit.indexObjArrBy(mapsTable,"Base_Source");
//     var sourceObjArr = [];
//     sourcesTable.forEach(function(row){
//       var allFilledBool = checkAllFilled(row);
//       if(allFilledBool){
//         row.label = sourceName;
//         var dataObj =  Toolkit.copyObject(row);
//         getCounter(dataObj,sourcesObj,sourceName);
//         dataObj.map = mapsIndexedSourceNum[row['#']];
//         sourceObjArr.push(dataObj);
//       }
//     })
//     return sourceObjArr;
//   }
  
//   function createIndexedSourcesFile(ALL_FILES_IDS,subTablesObj){
//     var sourcesIndexedFileId = ALL_FILES_IDS.sourcesIndexedFileId;
//     sourcesObj = Toolkit.readFromJSON(sourcesIndexedFileId);
//     Object.keys(subTablesObj).forEach(function(sourceName){
//       var subTables = subTablesObj[sourceName];
//       var sourceObjArr = formIndexedSourcesObject(sourceName,subTables);
//       if(branch){
//         sourcesObj[branch][sourceName] = sourceObjArr;
//       }
//     })
//     Toolkit.writeToJSON(sourcesObj,sourcesIndexedFileId);
//   }
  
//   function formIndexedSourcesObject(sourceName,subTables){
//     var sourcesTable = subTables["sources"].entriesDataObjArr;
//     var mapsTable = subTables["maps"].entriesDataObjArr;
//     var mapsIndexedSourceNum =  Toolkit.indexObjArrBy(mapsTable,"Base_Source");
//     var sourceObjArr = [];
//     sourcesTable.forEach(function(row){
//       branch = row.branch;
//       var allFilledBool = checkAllFilled(row);
//       if(allFilledBool){
//         if(!sourcesObj[branch]){
//           sourcesObj[branch] = {};
//         }
//         row.label = sourceName;
//         var dataObj =  Toolkit.copyObject(row);
//         getCounter(dataObj,sourcesObj[branch],sourceName);
//         dataObj.map = mapsIndexedSourceNum[row['#']];
//         sourceObjArr.push(dataObj);
//       }
//     })
//     return sourceObjArr;
//   }
  
//   function getCounter(dataObj,parentObj,sourceName){
//     if(parentObj[sourceName]){
//       if(parentObj[sourceName][dataObj["#"] - 1]){
//         if(parentObj[sourceName][dataObj["#"] - 1].counter){
//           dataObj.counter = parentObj[sourceName][dataObj["#"] - 1].counter;
//         }else{
//           dataObj.counter = 0;
//         }
//       }else{
//         dataObj.counter = 0;
//       }
//     }else{
//       dataObj.counter = 0;
//     }
//   }
  
//   function checkAllFilled(row){
//     for(var key in row){
//       if(row[key] === ""){
//         return false;
//       }
//     }
//     return true;
//   }  
  
//   /////////////////////LEGACY
  
//   function createSuperIndexedSourcesFile(ALL_FILES_IDS,sheetName,subTables,writeFlag){
//     var sourcesIndexFileId = ALL_FILES_IDS.sourcesIndexFileId;
//     sourcesObj = Toolkit.readFromFile(sourcesIndexFileId,true);
//     var sourcesTable = subTables["sources"].entriesDataObjArr;
//     var mapsTable = subTables["maps"].entriesDataObjArr;
//     var mapsIndexedSourceNum =  Toolkit.indexObjArrBy(mapsTable,"Base_Source");
//     formSourcesObject(sheetName,sourcesTable,mapsIndexedSourceNum);
//     if(writeFlag){
//       var writeReturnObj = Toolkit.writeToFile(sourcesObj,sourcesIndexFileId);
//       if(writeReturnObj.firstTimeBool){
//         recordInIndex(writeReturnObj.fileId);
//       }
//     }
//   }
  
//   function recordInIndex(fileId){
//     sourcesIndex[branch] = fileId;
//     Utils.writeJSON(sourcesIndex,SOURCES_INDEX_FILE_ID);
//   }
  
//   function formSourcesObject(sheetName,subTables){
//     var sourcesTable = subTables["sources"].entriesDataObjArr;
//     var mapsTable = subTables["maps"].entriesDataObjArr;
//     var mapsIndexedSourceNum =  Toolkit.indexObjArrBy(mapsTable,"Base_Source");
//     sourcesTable.forEach(function(row){
//       var obj = {};
//       var mapObj = {};
//       branch = row.branch;
//       var allFilledBool = checkAllFilled(row);
//       if(allFilledBool){
//         obj = Toolkit.copyObject(row);
//         mapObj = mapsIndexedSourceNum[row['#']];
//         obj.map = formMaps(mapObj);
//         if(obj.include){
//           if(!sourcesObj[sheetName]){
//             sourcesObj[sheetName] = {};
//           }
//           if(!sourcesObj[sheetName][obj.secondaryClassifierCode]){
//             sourcesObj[sheetName][obj.secondaryClassifierCode] = {};
//           }
//           updateSourceObject(sourcesObj[sheetName][obj.secondaryClassifierCode],obj);
//         }
//       }
//     })
//   }
  
//   function updateSourceObject(sObj,obj){
//     var keys = Object.keys(obj);
//     keys.forEach(function(key){
//       sObj[key] = obj[key];
//     })
//   }
  
  
//   function formMaps(mapObj){
//     var mapsObj = {};
//     mapsObj.base = {};
//     mapsObj.extra = {};
//     var keys = Object.keys(mapObj);
//     keys.forEach(function(key){
//       if(key.indexOf('_b') != -1){
//         var nKey = key.slice(0,key.length-2);
//         mapsObj.base[nKey] = mapObj[key];
//       }else{
//         mapsObj.extra[key] = mapObj[key];
//       }
//     })
//     return mapsObj
//   }
  
//   sourcesFileContruction.init = init;
//   sourcesFileContruction.createUnpackedSourcesFile = createUnpackedSourcesFile;
//   sourcesFileContruction.createIndexedSourcesFile = createIndexedSourcesFile;
  
//   return sourcesFileContruction
  
// })