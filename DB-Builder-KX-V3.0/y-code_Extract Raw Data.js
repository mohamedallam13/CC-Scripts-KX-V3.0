; (function (root, factory) {
  root.CCEXTRACTDATA = factory()
})(this, function () {

  const CCEXTRACTDATA = {};

  const COUNTER_RESET_BOOL = false;

  function init(rawSourceData) {
    switch (rawSourceData.type) {
      case 'GSheet':
        return readFromGSheetSource(rawSourceData);
      default:
    }
  }

  function readFromGSheetSource(rawSourceData) {
    var sheetObj = getSourceSheetObj(rawSourceData);
    var latestEntries = getLatestIncrementaly(sheetObj, rawSourceData);
    return { latestEntries: latestEntries, sheetObj: sheetObj }
  }

  function getSourceSheetObj(rawSourceData) {
    var ssid = rawSourceData.ssid;
    var sheetName = rawSourceData.sheetName;
    var parseObj = {
      headerRow: rawSourceData.headerRow,
      skipRows: rawSourceData.skipRows
    }
    var ssMan = imp.createSpreadsheetManager(ssid,[sheetName]);
    var sheetObj = imp.parseSheet(ssMan,sheetName, parseObj);
    return sheetObj;
  }

  function getLatestIncrementaly(sheetObj, source) {
    //Incremental Method
    var objData = sheetObj.objectifiedValues.entriesDataObjArr;
    var oldCount = COUNTER_RESET_BOOL ? 0 : source.counter;
    var newCount = objData.length;
    if (newCount - oldCount > 0) {
      source.counter = newCount;
      return objData.slice(oldCount);
    }
  }

  CCEXTRACTDATA.init = init;
  return CCEXTRACTDATA;
})