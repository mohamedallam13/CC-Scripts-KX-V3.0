; (function (root, factory) {
  root.KXDBHANDLER = factory()
})(this, function () {

  const KXDBHANDLER = {};

  const SECTION_SIZE = 10000;

  var jsonDBIndexFileId
  var jsonDBIndex

  var rawSourceData

  var aggregatedDBObj
  var sourceDBFileContentObj

  //INITIATE

  function initializeHandler(allFileIds) {
    jsonDBIndexFileId = allFileIds.JSONDBsIndexFileId;
    jsonDBIndex = Toolkit.readFromJSON(jsonDBIndexFileId);
  }

  //CREATE

  function initializeAggregatingDB(aggregateDBNamesArr) {
    aggregatedDBObj = {};
    aggregateDBNamesArr.forEach(dbName => {
      if (!isThisDBNameInJSONIndex(dbName)) {
        console.log("This Aggregated DB is not in JSONDBs Index, please create it first and add a directory folder.");
        return;
      }
      var dbFilesList = jsonDBIndex[dbName].dbFiles;
      if (isObjEmpty(dbFilesList)) {
        console.log("There are no files found, starting a completely new object.");
        aggregatedDBObj[dbName] = createNewDBFileObj();
        return
      }
      var fullDBContentObj = readAggregatedDBFiles(dbFilesList);
      if (isObjEmpty(fullDBObj)) {
        console.log("Files were cleared, starting a completely new object.");
        aggregatedDBObj[dbName] = createNewDBFileObj()
      } else {
        console.log("Files were found, merged and DB is ready to recieve new entries.");
        aggregatedDBObj[dbName] = fullDBContentObj;
      }
    })
    return aggregatedDBObj;
  }

  function isThisDBNameInJSONIndex(dbName) {
    if (jsonDBIndex[dbName]) {
      return true
    }
    return;
  }

  function readAggregatedDBFiles(dbFilesList) {
    var sections = Object.keys(dbFilesList);
    var fullDBContentObj = {};
    sections.forEach((sectionName, i) => {
      var sectionInfoObj = dbFilesList[sectionName];
      var sectionObj = Toolkit.readFromJSON(sectionInfoObj.id);
      if (isObjEmpty(sectionObj)) {
        return;
      }
      mergeSubSections(fullDBContentObj, sectionObj, i);
    })
    return fullDBContentObj;
  }

  function mergeSubSections(fullDBContentObj, sectionObj, i) {
    var subSections = Object.keys(sectionObj);
    subSections.forEach(subSection => {
      if (i == 0) {
        fullDBContentObj[subSection] = sectionObj[subSection]
      } else {
        if (sectionObj[subSection]) {
          Object.assign(fullDBContentObj[subSection], sectionObj[subSection]);
        }
      }
    })
  }

  function initializeSourceDB(rawSource) {
    rawSourceData = rawSource;
    var branch = rawSourceData.branch;
    var primaryClassifierCode = rawSourceData.primaryClassifierCode;
    var secondaryClassifierCode = rawSourceData.secondaryClassifierCode;

    if (!isThisSourceMainActivityInJSONIndex(branch, primaryClassifierCode)) {
      console.log("This Source Activity is JSONDBs Index, please create it first and add a directory folder.");
      return;
    }
    var dbFilesList = jsonDBIndex[branch][primaryClassifierCode].dbFiles;
    if (!dbFilesList[secondaryClassifierCode]) {
      console.log("This source does not have a file yet, starting starting a completely new object.");
      sourceDBFileContentObj = createNewDBFileObj();
      return sourceDBFileContentObj;
    }
    sourceDBFileContentObj = readSourceBDFile(dbFilesList[secondaryClassifierCode]);
    if (isObjEmpty(sourceDBFileContentObj)) {
      console.log("Files were cleared, starting a completely new object.");
      sourceDBFileContentObj = createNewDBFileObj();
      return sourceDBFileContentObj();
    }
    console.log("File was found and ready to recieve new entries.");
    return sourceDBFileContentObj;
  }

  function readSourceBDFile(dbFileObj) {
    var fileId = dbFileObj.id;
    var dbFileContentObj = Toolkit.readFromJSON(fileId);
    return dbFileContentObj;
  }

  function isThisSourceMainActivityInJSONIndex(branch, primaryClassifierCode) {
    if (jsonDBIndex[branch][primaryClassifierCode]) {
      return true
    }
    return;
  }

  function isObjEmpty(obj) {
    return Object.keys(obj) == 0;
  }

  function createNewDBFileObj() {
    return { index: {}, data: {} }
  }

  //UPDATE

  function updateSourceDBFile() {
    var branch = rawSourceData.branch;
    var primaryClassifierCode = rawSourceData.primaryClassifierCode;
    var secondaryClassifierCode = rawSourceData.secondaryClassifierCode;
    var hostJSONDBIndex = jsonDBIndex[branch][primaryClassifierCode];
    var dbFileIndexObj = new DBFileIndexObj(hostJSONDBIndex, sourceDBFileContentObj, hostJSONDBIndex.fileNamePrefix, secondaryClassifierCode);
    writeToDBFile(sourceDBFileContentObj, dbFileIndexObj)
    updateJSONDBIndexFile(hostJSONDBIndex, secondaryClassifierCode, dbFileIndexObj);
  }

  function updateAggregatingDB() {
    var aggregatedDBNames = Object.keys(aggregatedDBObj);
    aggregatedDBNames.forEach(updateSectionsDB);
  }

  function updateSectionsDB(dbName) {
    var keys = getContentKeys(dbName)
    var keyArrays = getKeyArrays(keys, SECTION_SIZE);
    keyArrays.forEach(function (keys, i) {
      var section = getSection(i);
      var contentObj = aggregatedDBObj[dbName];
      var sectionContentObj = createSectionContentObj(keys, contentObj, dbName);
      var hostJSONDBIndex = jsonDBIndex[dbName];
      var dbFileIndexObj = new DBFileIndexObj(hostJSONDBIndex, sourceDBFileContentObj, hostJSONDBIndex.fileNamePrefix, section);
      writeToDBFile(sectionContentObj, dbFileIndexObj)
      updateJSONDBIndexFile(hostJSONDBIndex, section, dbFileIndexObj);
    });
  }

  function getContentKeys(dbName) {
    var aggregatedDataObj = aggregatedDBObj[dbName].data;
    return Object.keys(aggregatedDataObj);
  }


  function getKeyArrays(keys, count) {
    var keyArrays = [];
    var keysCount = keys.length;
    var rounds = Math.ceil(keysCount / count);
    for (var i = 0; i < rounds; i++) {
      var start = i * count;
      var finish = ((i + 1) * count) > keysCount ? keysCount : ((i + 1) * count);
      var piece = keys.slice(start, finish);
      keyArrays.push(piece);
    }
    return keyArrays;
  }

  function createSectionContentObj(keysArray, contentObj, dbName) {
    var sectionContentObj = createNewDBFileObj();
    keysArray.forEach(function (key) {
      if (key == "") {
        return
      }
      if (dbName == "CCOne") {
        prodcueIndex(sectionContentObj, contentObj.data[key], key);
      } else {
        delete sectionContentObj.index;
      }
      sectionContentObj.data[key] = contentObj.data[key];
    });
  }

  function prodcueIndex(writeObj, userDBObjData, key) {
    if (userDBObjData.allEmailAddresses) {
      userDBObjData.emailsArr.forEach(function (email) {
        writeObj.index[email] = key;
      })
    } else {
      var email = userDBObjData.submissions[0].Email;
      writeObj.index[email] = key;
    }
  }

  function writeToDBFile(dbFileContentObj, dbFileIndexObj) {
    Toolkit.writeToJSON(dbFileContentObj, dbFileIndexObj.fileId);
  }

  function updateJSONDBIndexFile(hostJSONDBIndex, section, dbFileIndexObj) {
    hostJSONDBIndex.dbFiles[section] = dbFileIndexObj;
    Toolkit.writeToJSON(jsonDBIndex, jsonDBIndexFileId);
  }

  function DBFileIndexObj(hostJSONDBIndex, contentDBObj, filePrefix, section) {
    var currentDBFileIndex = hostJSONDBIndex.dbFiles[section];
    this.id = currentDBFileIndex ? currentDBFileIndex.id : generateNewDBFile(filePrefix, section, hostJSONDBIndex.folderId);
    this.indexKeysInFile = Object.keys(contentDBObj.index);
    this.version = getCurrentVersion();
  }

  function generateNewDBFile(filePrefix, section) {
    var filename = filePrefix + "_" + section + ".json";
    var folderId = indexObj.folderId;
    var newSectionJSONFileId = Toolkit.createJSON(filename, folderId, {});
    return newSectionJSONFileId;
  }

  function getSection(i) {
    var letter = Toolkit.numToChar(i + 1);
    return "section" + letter;
  }

  //CLEAR

  function clearDBs() {
    ALL_FILE_IDS = arguments[0]
    DB_APPLICATIONS = arguments[1];
    setGlobals();
    clearApplications();
    clearSectionsDB();
  }

  function clearApplications() {
    DB_APPLICATIONS.forEach(function (branch) {
      if (allJSONDBIndexObj[branch]) {
        var divisions = Object.keys(allJSONDBIndexObj[branch]);
        divisions.forEach(function (division) {
          var filesObj = allJSONDBIndexObj[branch][division].dbFiles;
          var files = Object.keys(filesObj);
          files.forEach(function (filename) {
            console.log("Clearing Files: " + filename);
            var fileId = filesObj[filename];
            Toolkit.writeToJSON({}, fileId);
          })
        })
      }
    })
  }

  function clearSectionsDB() {
    var dbNames = Object.keys(DB_BY_SECTION_OBJ);
    dbNames.forEach(function (dbName) {
      var filesObj = allJSONDBIndexObj[dbName].dbFiles
      var files = Object.keys(filesObj);
      files.forEach(function (filename) {
        console.log("Clearing Files: " + dbName + " " + filename);
        var fileId = filesObj[filename];
        Toolkit.writeToJSON({}, fileId);
      })
    })
  }

  //DESTROY


  KXDBHANDLER.initializeHandler = initializeHandler;
  KXDBHANDLER.initializeAggregatingDB = initializeAggregatingDB;
  KXDBHANDLER.initializeSourceDB = initializeSourceDB;
  KXDBHANDLER.updateSourceDBFile = updateSourceDBFile;
  KXDBHANDLER.updateAggregatingDB = updateAggregatingDB;


  return KXDBHANDLER;
})