; (function (root, factory) {
  root.SOURCES_MANAGER_OPTIONS = factory()
})(this, function () {

  const SOURCES_MANAGER_OPTIONS = {};

  var sheetNames;

  function getSheetNames() {
    sheetNames = ["CCMAIN", "CCG"]
  }

  function getCurrentSheet() {
    return SpreadsheetApp.getActiveSheet().getSheetName();
  }

  function setMapsForAll() {
    getSheetNames();
    var sourcesSSObj = DIVIDED_SHEETS_MANAGER.getSpreadSheetObj();
    sheetNames.forEach(sheetName => {
      setMapsPerActivity(sheetName, sourcesSSObj)
    })
  }

  function setMapsPerActivity(sheetName, sourcesSSObj) {
    sheetName = sheetName || getCurrentSheet();
    sourcesSSObj = sourcesSSObj || DIVIDED_SHEETS_MANAGER.getSpreadSheetObj();
    var subTablesObj = sourcesSSObj.readSourcesSheet(sheetName).sheetsObject[sheetName].subTablesObj;
    var sources = subTablesObj.sources;
    var maps = subTablesObj.maps;
    var sheet = subTablesObj.Sheet;
    var lastSource = sources.objectifiedValues[sources.objectifiedValues.length - 1];
    var lastMapEntry = maps.objectifiedValues[maps.objectifiedValues.length - 1];
    var diff = checkDifference(lastSource, lastMapEntry);
    if (!diff) {
      return;
    }
    addColumnsForMapTable(diff, sheet, maps, lastMapEntry);
    processNewEntries(sources, maps, sheet, lastMapEntry)
  }

  function checkDifference(lastSource, lastMapEntry) {
    var lastSourceCount = parseInt(lastSource["#"]);
    var lastEntryCount = parseInt(lastMapEntry["Base_Source"]);
    var diff = lastEntryCount - lastSourceCount;
    if (diff == 0) {
      return;
    }
    return diff;
  }

  function addColumnsForMapTable(diff, sheet, lastMapEntry) {
    sheet.insertColumns(lastMapEntry.orderInSheet, diff);
  }

  function processNewEntries(sources, maps, sheet, lastMapEntry) {
    var unMappedSources = sources.objectifiedValues.slice(-diff);
    for (let i = 0; i < unMappedSources.length; i++) {
      var unMappedSourceObj = unMappedSources[i];
      var sourceHeader = getHeaderArr(unMappedSourceObj);
      var mapsRow = maps.startRow;
      var mapsCol = lastMapEntry + i + 1;
      var mapsRows = maps.lastRow - maps.startRow + 1
      Toolkit.setValidationList(sheet, sourceHeader, mapsRow, mapsCol, mapsRows, 1);
      if (unMappedSourceObj.autoActivate != "YES") {
        continue;
      }
      addLastMap(lastMapEntry, sheet, mapsRow, mapsCol);
      setSourceTableValue(sheet, sources, unMappedSource, "activated", "YES");
      if (unMappedSourceObj.autoInclude != "YES") {
        continue;
      }
      setSourceTableValue(sheet, sources, unMappedSource, "include", true);
    }
  }

  function getHeaderArr(unMappedSourceObj) {
    var parseObj = {
      headerRow: unMappedSourceObj.headerRow,
      skipRows: unMappedSourceObj.skipRows
    }
    var impObj = imp.createSpreadsheetManager(unMappedSourceObj.ssid);
    var sheetObj = impObj.addSheets(unMappedSourceObj.sheetName).parseSheet(parseObj);
    var header = sheetObj.header;
    sourceHeader.unshift(unMappedSourceObj["#"]);
    return header
  }

  function addLastMap(lastMapEntry, sheet, row, col) {
    var keys = Object.keys(lastMapEntry);
    var writeCol = keys.map(key => [lastMapEntry[key]]);
    sheet.getRange(row, col, writeCol.length, writeCol[0].length).setValues(writeCol);
  }

  function setSourceTableValue(sheet, sources, targetSourceObj, columnHeader, value) {
    var sourceRow = targetSourceObj.orderInSheet;
    var colIndex = header.indexOf(columnHeader);
    var sourceCol = sources.startCol + colIndex;
    sheet.getRange(sourceRow, sourceCol).setValue(value);
  }

  SOURCES_MANAGER_OPTIONS.setMapsForAll = setMapsForAll;
  SOURCES_MANAGER_OPTIONS.setMapsPerActivity = setMapsPerActivity;

  return SOURCES_MANAGER_OPTIONS

})

function runAutoAddSource(param) {
  SOURCE_INFO_MANAGER.addNewSource(param);
  SOURCES_MANAGER_OPTIONS.setMapsPerActivity(param.activity);
  SOURCE_FILE_CONSTRUCTOR.createSourcesFile();
}