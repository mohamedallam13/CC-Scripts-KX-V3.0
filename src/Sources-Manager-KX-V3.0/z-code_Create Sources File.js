; (function (root, factory) {
  root.SOURCE_FILE_CONSTRUCTOR = factory()
})(this, function () {

  const SOURCE_FILE_CONSTRUCTOR = {};

  const MASTER_INDEX_FILE_ID = "18v8jqGGsu3PYmLWkFH0tFVSqhQzMJfsn"

  var sheetNames;

  var masterIndex;
  var sourceOriginalFile;

  function getSheetNames() {
    sheetNames = ["CCMAIN", "CCG"]
  }

  function createSourcesFile(isNewBool) {
    var fileObj = {};
    getSheetNames();
    getReferences();
    var sourcesSSObj = DIVIDED_SHEETS_MANAGER.getSpreadSheetObj();
    sheetNames.forEach(sheetName => {
      sourcesSSObj.readSourcesSheet(sheetName);
      var subTablesObj = sourcesSSObj.sheetsObject[sheetName].subTablesObj;
      populateFileObj(fileObj, subTablesObj, isNewBool)
    })
    Toolkit.writeToJSON(fileObj, masterIndex.sourcesIndexedFileId);
  }

  function getReferences() {
    masterIndex = masterIndex || Toolkit.readFromJSON(MASTER_INDEX_FILE_ID);
    sourceOriginalFile = sourceOriginalFile || Toolkit.readFromJSON(masterIndex.sourcesIndexedFileId);

  }

  function populateFileObj(fileObj, subTablesObj, isNewBool) {
    var sourcesObjValues = subTablesObj.sources.objectifiedValues;
    var maps = subTablesObj.maps.objectifiedValues;

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
    if (!sourceOriginalFile[source.branch]) {
      return;
    }
    if (!sourceOriginalFile[source.branch][source.primaryClassifierCode]) {
      return;
    }
    if (!sourceOriginalFile[source.branch][source.primaryClassifierCode][i]) {
      return
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
