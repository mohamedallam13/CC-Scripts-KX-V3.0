; (function (root, factory) {
  root.SOURCE_INFO_MANAGER = factory()
})(this, function () {

  const SOURCE_INFO_MANAGER = {};

  // const SHEETS_ARRAY = getSources();

  const REFERENCES_MANAGER = CCLIBRARIES.REFERENCES_MANAGER;
  const DIVIDED_SHEETS_MANAGER = CCLIBRARIES.DSMF;
  const SHEETS_ARRAY = SHEET_PROPERTIES.SHEETS_ARRAY;
  const SSID = SHEET_PROPERTIES.SSID;
  const SHEET_OPTIONS_ARRAY = SHEET_PROPERTIES.SHEET_OPTIONS_ARRAY;

  const REQUIRED_REFERENCES = ["divisionsProperties"];

  var referencesObj;

  function getCurrentSheet() {
    return SpreadsheetApp.getActiveSheet().getSheetName();
  }

  function addNewSourcesInAllSheets() {
    var sourcesSSObj = DIVIDED_SHEETS_MANAGER.init();
    SHEETS_ARRAY.forEach(sheetName => {
      addAllSourcesPerActivity(sheetName, sourcesSSObj)
    })
  }

  function addAllSourcesPerActivity(sheetName, sourcesSSObj) {
    sheetName = sheetName || getCurrentSheet();
    sourcesSSObj = sourcesSSObj || DIVIDED_SHEETS_MANAGER.init(SSID);
    var dividedSheetsObject = sourcesSSObj.readDividedSheet({ sheetName: sheetName, rangesOptionsArray: SHEET_OPTIONS_ARRAY }).dividedSheetsObject;
    var dividedSheetObj = dividedSheetsObject[sheetName];
    var sources = dividedSheetObj.subTablesObj.sources;
    var pendingSources = getPendingSources(sources);
    pendingSources.forEach(pendingSource => {
      var param = {
        dividedSheetObj: dividedSheetObj, // Because we need the Sheet parameter which resides in the dividedSheetObj of each sheet
        orderInSheet: pendingSource.orderInSheet,
        primaryClassifierCode: sheetName,
        URL: pendingSource.URL
      }
      var param = Object.assign({}, pendingSource, param);
      addNewSource(param);
    })
  }

  function getPendingSources(sources) {
    var pendingSources = sources.objectifiedValues.filter(row => row.activated != "YES");
    return pendingSources;
  }

  function addNewSource(param) {
    var paramObj = new ParamObj(param);
    getReferences();
    var completeInfoObj;
    switch (paramObj.sourceType) {
      case "GSheet":
        completeInfoObj = new CompleteGSheetInfoObj(paramObj);

      default:
    }
    writeToSources(completeInfoObj)
  }

  function getReferences() {
    referencesObj = REFERENCES_MANAGER.defaultReferences.requireFiles(REQUIRED_REFERENCES).requiredFiles;
  }

  function ParamObj(param) {
    var self = this;
    Object.assign(this, param);
    this.sourceType = this.sourceType || this.type;
    this.dividedSheetObj = param.dividedSheetsObject || DIVIDED_SHEETS_MANAGER.init(SSID).readDividedSheet({ sheetName: this.primaryClassifierCode, rangesOptionsArray: SHEET_OPTIONS_ARRAY }).dividedSheetsObject[this.primaryClassifierCode];
  }

  function CompleteGSheetInfoObj(paramObj) {
    // Defaults
    var self = this;
    //Merging to replace defaults
    Object.assign(this, paramObj);
    this.type = this.sourceType || this.type;
    this.sheetName = !this.sheetName || this.sheetName == "" ? "Form Responses 1" : this.sheetName;
    this.headerRow = !this.headerRow || this.headerRow == "" ? 1 : this.headerRow;
    this.skipRows = !this.skipRows || this.skipRows == "" ? 0 : this.skipRows;
    if (paramObj.autoActions) {
      Object.assign(this, paramObj.autoActions);
    }
    if (paramObj.formResponsesOptions) {
      Object.assign(this, paramObj.formResponsesOptions);
    }
    var sourceSpreadsheet = this.URL ? SpreadsheetApp.openByUrl(this.URL) : SpreadsheetApp.openByUrl(this.ssid);
    this.ssid = sourceSpreadsheet.getId();
    this.URL = sourceSpreadsheet.getUrl();
    this.bookName = sourceSpreadsheet.getName();
    this.creationDate = DriveApp.getFileById(this.ssid).getDateCreated();
    this.formid = "No Form";
    var formURL = sourceSpreadsheet.getFormUrl();
    if (formURL) {
      var form = FormApp.openByUrl(formURL);
      this.formid = form.getId();
    }
    Object.assign(this, new SourceInfo(paramObj));
    delete this["#"];
  }

  function SourceInfo(paramObj) {
    var divisionsProperties = referencesObj.divisionsProperties.fileContent;
    this.primaryClassifierCode = paramObj.primaryClassifierCode;
    this.branch = findParentParamter(divisionsProperties, this.primaryClassifierCode);
    this.primaryClassifierName = divisionsProperties[this.branch][this.primaryClassifierCode].name;
    this.secondaryClassifierName = paramObj.secondaryClassifierName || "";
    this.secondaryClassifierCode = paramObj.secondaryClassifierCode || "";
  }

  function findParentParamter(obj, childParameter) {
    for (let key in obj) {
      var childObj = obj[key];
      var childKeys = Object.keys(childObj);
      if (childKeys.indexOf(childParameter) != -1) {
        return key;
      }
    }
  }

  function writeToSources(completeInfoObj) {
    var dividedSheetObj = completeInfoObj.dividedSheetObj;
    var sourcesTableObj = dividedSheetObj.subTablesObj.sources;
    var writeArr = getWriteArr(completeInfoObj, sourcesTableObj.header);
    var writeRow = completeInfoObj.orderInSheet || sourcesTableObj.lastRow + 1; // Is this a pending source? if yes the info will include orderInSheet, if not then we simply append to the end of the sources table as a new source coming over from the API
    dividedSheetObj.Sheet.getRange(writeRow, sourcesTableObj.startCol, writeArr.length, writeArr[0].length).setValues(writeArr);
  }

  function getWriteArr(completeInfoObj, header) {
    var writeArr = []
    var rowArr = [];
    header.forEach(col => {
      if (completeInfoObj[col] !== undefined) {
        rowArr.push(completeInfoObj[col])
      } else {
        rowArr.push(null)
      }
    })
    writeArr.push(rowArr);
    return writeArr;
  }

  SOURCE_INFO_MANAGER.addNewSource = addNewSource;
  SOURCE_INFO_MANAGER.addAllSourcesPerActivity = addAllSourcesPerActivity;
  SOURCE_INFO_MANAGER.addNewSourcesInAllSheets = addNewSourcesInAllSheets;

  return SOURCE_INFO_MANAGER

})