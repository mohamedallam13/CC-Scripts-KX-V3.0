; (function (root, factory) {
  root.SOURCE_INFO_MANAGER = factory()
})(this, function () {

  const SOURCE_INFO_MANAGER = {};

  const REFERENCES_MANAGER = CCLIBRARIES.REFERENCES_MANAGER;

  const REQUIRED_REFERENCES = ["divisionsProperties"];

  var referencesObj;

  function getCurrentSheet() {
    return SpreadsheetApp.getActiveSheet().getSheetName();
  }

  function addNewSourcesInAllSheets() {
    var sourcesSSObj = DIVIDED_SHEETS_MANAGER.getSpreadSheetObj();
    SHEETS_ARRAY.forEach(sheetName => {
      addAllSourcesPerActivity(sheetName, sourcesSSObj)
    })
  }

  function addAllSourcesPerActivity(sheetName, sourcesSSObj) {
    sheetName = sheetName || getCurrentSheet();
    sourcesSSObj = sourcesSSObj || DIVIDED_SHEETS_MANAGER.getSpreadSheetObj();
    sourcesSSObj.readSourcesSheet(sheetName);
    var subTablesObj = sourcesSSObj.sheetsObject[sheetName].subTablesObj;
    var sources = subTablesObj.sources.objectifiedValues;
    var pendingSources = getPendingSources(sources);
    pendingSources.forEach(pendingSource => {
      var param = {
        sources: sources,
        pendingSource: pendingSource,
        URL: pendingSource.URL
      }
      addNewSource(param);
    })
  }

  function getPendingSources(sources) {
    var pendingSources
    return pendingSources;
  }

  function addNewSource(param) {
    var paramObj = new ParamObj(param);
    getReferences();
    var completeInfoObj;
    switch (param.sourceType) {
      case "gSheet":
        completeInfoObj = new CompleteGSheetInfoObj(paramObj);

      default:
    }
    writeToSources(completeInfoObj, source)
  }

  function getReferences() {
    referencesObj = REFERENCES_MANAGER.defaultReferences.requireFiles(REQUIRED_REFERENCES).requiredFiles;
  }

  function ParamObj(param) {
    Object.assigm(this, param);
    this.sheetName = param.activity || sources.Sheet.getSheetName();
    this.sources = sources || DIVIDED_SHEETS_MANAGER.getSpreadSheetObj().readSourcesSheet(this.sheetName).subTablesObj;
  }

  function CompleteGSheetInfoObj(paramObj) {
    this.queryParam = Object.assign({}, paramObj);
    this.type = this.sourceType;
    this.sheetName = "Form Responses 1";
    this.headerRow = 1;
    this.skipRows = 0;
    if (paramObj.autoActions) {
      Object.assign(this, paramObj.autoActions);
    }
    if (paramObj.formResponsesOptions) {
      Object.assign(this, paramObj.formResponsesOptions);
    }
    var sourceSpreadsheet = paramObj.URL ? SpreadsheetApp.openByUrl(URL) : SpreadsheetApp.openByUrl(param.ssid);
    this.ssid = sourceSpreadsheet.getId();
    this.URL = sourceSpreadsheet.getUrl();
    this.bookName = sourceSpreadsheet.getName();
    this.creationDate = DriveApp.getFileById(this.ssid).getDateCreated();
    this.formId = "No Form";
    var formURL = sourceSpreadsheet.getFormUrl();
    if (formURL) {
      var form = FormApp.openByUrl(formURL);
      this.formId = form.getId();
    }
    Object.assign(this, new SourceInfo(paramObj));
    this.accepting = paramObj.accepting ? paramObj.accepting.toString().toUpperCase() : "TRUE";
    this.include = paramObj.include ? paramObj.include : false;
  }

  function SourceInfo(paramObj) {
    var divisionsProperties = referencesObj.divisionsProperties.fileContent;
    this.primaryClassifierCode = paramObj.sheetName;
    this.branch = findParentParamter(divisionsProperties, this.primaryClassifierCode);
    this.primaryClassifierName = divisionProperties[this.branch][this.primaryClassifierCode].name;
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

  function writeToSources(completeInfoObj, source) {
    var writeArr = getWriteArr(completeInfoObj, source.header);
    var pendingSource = completeInfoObj.queryParam.pendingSource
    var writeRow = pendingSource ? pendingSource.orderInSheet : source.lastRow + 1;
    source.Sheet.getRange(writeRow, source.startCol, writeArr[0].length, writeArr.length).setValues(writeArr);
  }

  function getWriteArr(completeInfoObj, header) {
    var writeArr = []
    var rowArr = [];
    header.forEach(col => {
      rowArr.push(completeInfoObj[col])
    })
    writeArr.push(rowArr);
    return writeArr;
  }

  SOURCE_INFO_MANAGER.addNewSource = addNewSource;
  SOURCE_INFO_MANAGER.addAllSourcesPerActivity = addAllSourcesPerActivity;
  SOURCE_INFO_MANAGER.addNewSourcesInAllSheets = addNewSourcesInAllSheets;

  return SOURCE_INFO_MANAGER

})

function addNewSourcesInAllSheets() {
  SOURCE_INFO_MANAGER.addNewSourcesInAllSheets();
}

function addAllSourcesPerActivity() {
  SOURCE_INFO_MANAGER.addAllSourcesPerActivity();
}

function addNewSource(param) {
  SOURCE_INFO_MANAGER.addNewSource(param);
}