; (function (root, factory) {
  root.SOURCE_FILE_CONSTRUCTOR = factory()
})(this, function () {

  const SOURCE_FILE_CONSTRUCTOR = {};

  const REFERENCES_MANAGER = CCLIBRARIES.REFERENCES_MANAGER;
  const DIVIDED_SHEETS_MANAGER = CCLIBRARIES.DSMF;
  const SHEETS_ARRAY = SHEET_PROPERTIES.SHEETS_ARRAY;
  const SSID = SHEET_PROPERTIES.SSID;
  const SHEET_OPTIONS_ARRAY = SHEET_PROPERTIES.SHEET_OPTIONS_ARRAY;

  const REQUIRED_REFERENCES = ["sourcesIndexed"];

  var referencesObj;
  var fileObj = {};


  function createSourcesFile(isNewBool) {
    getReferences();
    var sourcesSSObj = DIVIDED_SHEETS_MANAGER.init(SSID);
    SHEETS_ARRAY.forEach(sheetName => { // SHEETS_ARRAY is the array brought in from the division properties file because this file is the main config for all divisions, so it is logical to have it as the source
      var dividedSheetObj = sourcesSSObj.readDividedSheet({ sheetName: sheetName, rangesOptionsArray: SHEET_OPTIONS_ARRAY }).dividedSheetsObject[sheetName];
      populateFileObj(fileObj, dividedSheetObj, isNewBool)
    })
    writeToSourcesFile();
  }

  function getReferences() {
    referencesObj = REFERENCES_MANAGER.defaultReferences.requireFiles(REQUIRED_REFERENCES).requiredFiles;
  }

  function writeToSourcesFile() {
    referencesObj.sourcesfilesindex.update();
  }

  function populateFileObj(fileObj, dividedSheetsObject, isNewBool) {
    var sourcesObjValues = dividedSheetsObject.subTablesObj.sources.objectifiedValues;
    var maps = dividedSheetsObject.subTablesObj.maps.objectifiedValues;

    sourcesObjValues.forEach((source, i) => {
      if (!source.include) {
        return;
      }
      var originalEntry = getOriginalSourcesArr(source, i);
      var newSourceEntry = createSourceFileEntryObj(source, maps, isNewBool, originalEntry);
      addToFileObj(fileObj, newSourceEntry)
    });
  }

  function createSourceFileEntryObj(source, maps, isNewBool, originalEntry) {
    var sourceNum = source["#"]
    var map = checkInArray(maps, "Base_Source", sourceNum);
    source.map = map;
    if (isNewBool) {
      source.counter = 0;
    }
    if (originalEntry) {
      newSourceEntry = Object.assign({}, origianlSource, source);
    }
    return newSourceEntry
  }

  function getOriginalSourcesArr(source, i) {
    var sourceOriginalFile = referencesObj.sourcesIndexed.fileContent;
    if (!sourceOriginalFile[source.branch]) {
      fileObj[source.branch] = {};
    }
    if (!sourceOriginalFile[source.branch][source.primaryClassifierCode]) {
      fileObj[source.branch][source.primaryClassifierCode] = [];
    }
    if (!sourceOriginalFile[source.branch][source.primaryClassifierCode][i]) {
      return { counter: 0 }
    }
    return sourceOriginalFile[source.branch][source.primaryClassifierCode][i];
  }

  function checkInArray(obj, searchField, itemToSearch) {
    return obj.filter(row => row[searchField] == itemToSearch)[0];
  } //TODO move to tools

  function addToFileObj(fileObj, source) {
    if (!fileObj[source.branch]) {
      fileObj[source.branch] = {}
    }
    if (!fileObj[source.branch][source.primaryClassifierCode]) {
      fileObj[source.branch][source.primaryClassifierCode] = [];
    }
    fileObj[source.branch][source.primaryClassifierCode].push(source);
  }

  SOURCE_FILE_CONSTRUCTOR.createSourcesFile = createSourcesFile;

  return SOURCE_FILE_CONSTRUCTOR

})

function createSourcesFile() {
  SOURCE_FILE_CONSTRUCTOR.createSourcesFile();
}
