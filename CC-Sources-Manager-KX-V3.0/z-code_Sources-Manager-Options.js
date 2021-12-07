; (function (root, factory) {
  root.SOURCES_MANAGER_OPTIONS = factory()
})(this, function () {

  const SOURCES_MANAGER_OPTIONS = {};

  const DIVIDED_SHEETS_MANAGER = CCLIBRARIES.DSMF;
  const imp = CCLIBRARIES.imp;

  const SHEETS_ARRAY = SHEET_PROPERTIES.SHEETS_ARRAY;
  const SSID = SHEET_PROPERTIES.SSID;
  const SHEET_OPTIONS_ARRAY = SHEET_PROPERTIES.SHEET_OPTIONS_ARRAY;

  var sheetObj;

  function setMapsForAll() {
    var sourcesSSObj = DIVIDED_SHEETS_MANAGER.getSpreadSheetObj();
    SHEETS_ARRAY.forEach(sheetName => {
      setMapsPerActivity(sheetName, sourcesSSObj)
    })
  }

  function setMapsPerActivity(sheetName, sourcesSSObj) {
    sheetName = sheetName || getCurrentSheet();
    sourcesSSObj = sourcesSSObj || DIVIDED_SHEETS_MANAGER.init(SSID);
    var dividedSheetObj = sourcesSSObj.readDividedSheet({ sheetName: sheetName, rangesOptionsArray: SHEET_OPTIONS_ARRAY }).dividedSheetsObject[sheetName];
    var sources = dividedSheetObj.subTablesObj.sources;
    var maps = dividedSheetObj.subTablesObj.maps;
    var sheet = dividedSheetObj.Sheet;
    var lastSource = sources.objectifiedValues[sources.objectifiedValues.length - 1];
    var lastMapEntry = maps.objectifiedValues[maps.objectifiedValues.length - 1];
    var diff = checkDifference(lastSource, lastMapEntry);
    if (diff > 0) {
      addColumnsForMapTable(diff + 1, sheet, lastMapEntry);
    }
    processAllEntries(sources, maps, sheet, maps.startCol);
  }

  function checkDifference(lastSource, lastMapEntry) {
    var lastSourceCount = parseInt(lastSource["#"]);
    var lastMapEntryCount = parseInt(lastMapEntry["Base_Source"]);
    var diff = lastSourceCount - lastMapEntryCount;
    return diff;
  }

  function addColumnsForMapTable(diff, sheet, lastMapEntry) {
    sheet.insertColumns(lastMapEntry.orderInSheet + 1, diff);
  }

  function processAllEntries(sources, maps, sheet, mapsStartCol) {
    var allSources = sources.objectifiedValues;
    var allMaps = maps.objectifiedValues;
    for (let i = 0; i < allSources.length; i++) {
      var sourceObj = allSources[i];
      var isInfoMissing = checkIfInfoIsMissing(sourceObj);
      if (isInfoMissing || sourceObj.activated == "YES") {
        // if already activated or info is missing, quit
        continue;
      }
      var sourceHeader = getHeaderArr(sourceObj);
      var mapsRow = maps.startRow;
      var mapsCol = mapsStartCol + i;
      var mapsRows = maps.lastRow - maps.startRow
      setValidationList(sheet, sourceHeader, mapsRow + 1, mapsCol + 1, mapsRows, 1);
      setNewMapOrder(sheet, mapsRow, mapsCol + 1, sourceObj["#"]);
      if (!sourceObj.autoActivate) {
        continue;
      }
      var lastFilledMap = getLastFilledMap(allMaps);
      if (!lastFilledMap) {
        continue;
      }
      addLastMap(lastFilledMap, sourceObj, sheet, mapsRow, mapsCol + 1);
      setSourceTableValue(sheet, sources, sourceObj, "activated", "YES");
      if (sourceObj.autoInclude != "YES") {
        continue;
      }
      setSourceTableValue(sheet, sources, sourceObj, "include", true);
    }
  }

  function checkIfInfoIsMissing(sourceObj) {
    if (sourceObj.secondaryClassifierName == "" || sourceObj.secondaryClassifierName == "" || sourceObj.ssid == "" || sourceObj.headerRow == "") {
      return true;
    }
    return;
  }

  function getHeaderArr(unMappedSourceObj) {
    var parseObj = {
      headerRow: unMappedSourceObj.headerRow,
      skipRows: unMappedSourceObj.skipRows
    }
    getSheetData(unMappedSourceObj, parseObj);
    var header = sheetObj.header;
    return header
  }

  function getSheetData(unMappedSourceObj, parseObj) {
    var ssid = unMappedSourceObj.ssid;
    var sheetName = unMappedSourceObj.sheetName;
    var impObj = imp.createSpreadsheetManager(ssid);
    sheetObj = impObj.addSheets([sheetName]).sheets[sheetName].parseSheet(parseObj);
    sheetObj.objectifyValues();
  }

  function setValidationList(sheet, list, row, col, rows, cols) {
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(list).build();
    if (rows && cols) {
      var range = sheet.getRange(row, col, rows, cols);
    } else {
      var range = sheet.getRange(row, col);
    }
    range.setDataValidation(rule);
  }

  function setNewMapOrder(sheet, mapsRow, mapsCol, sourceOrder) {
    sheet.getRange(mapsRow, mapsCol).setValue(sourceOrder);
  }

  function getLastFilledMap(allMaps) {
    for (let i = allMaps.length - 1; i >= 0; i--) {
      var currentMap = allMaps[i];
      if (currentMap[0] != "") {
        return currentMap;
      }
    }
  }

  function addLastMap(lastFilledMap, sourceObj, sheet, row, col) {
    lastFilledMap["Base_Source"] = sourceObj["#"];
    var keys = Object.keys(lastFilledMap);
    keys.pop() // remove the last key which is row in sheet, without having to delete it from the object and affecting important operations perhaps that would require it
    var writeCol = keys.map(key => [lastFilledMap[key]]);
    sheet.getRange(row, col, writeCol.length, writeCol[0].length).setValues(writeCol);
    SpreadsheetApp.flush();
  }

  function setSourceTableValue(sheet, sources, targetSourceObj, columnHeader, value) {
    var sourceRow = targetSourceObj.orderInSheet;
    var colIndex = sources.header.indexOf(columnHeader);
    var sourceCol = sources.startCol + colIndex;
    sheet.getRange(sourceRow, sourceCol).setValue(value);
  }

  SOURCES_MANAGER_OPTIONS.setMapsForAll = setMapsForAll;
  SOURCES_MANAGER_OPTIONS.setMapsPerActivity = setMapsPerActivity;

  return SOURCES_MANAGER_OPTIONS

})