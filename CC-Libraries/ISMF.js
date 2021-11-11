; (function (root, factory) {
  root.ISMF = factory()
})(this, function () {

  // Version 2

  const ISMF = {};

  const DEFAULT_SSID = "";
  const DEFAULT_RANGES_OPTIONS_ARRAY = [];
  const DEFAULT_TYPE = "";

  var Spreadsheet
  var ignoreEmpty = false;

  function init(ssid, initiateParam) {
    initiateSpreadSheet(ssid, initiateParam);
    const InterfaceSheetManager = {
      Spreadsheet: Spreadsheet,
      interfaceSheetsObj: {},
      allObjectifiedValues: {},
      allClearRanges: [],
      readInterfaceSheet: function (param) {
        var paramObj = new ParametersObj(param);
        var Sheet = this.Spreadsheet.getSheetByName(paramObj.sheetName);
        var ismObj = new InterfaceSheetObj(Sheet, paramObj);
        this.interfaceSheetsObj[paramObj.sheetName] = ismObj;
        Object.assign(this.allObjectifiedValues, ismObj.allObjectifiedValues);
        this.allClearRanges = this.allClearRanges.concat(ismObj.allClearRanges);
        return this;
      },
      clearAllRangesInSS: function () {
        clearAllRanges(this.allClearRanges)
        return this;
      }
    };
    return InterfaceSheetManager;
  }

  function initiateSpreadSheet(ssid, initiateParam) {
    SpreadsheetApp.flush();
    ssid = ssid || DEFAULT_SSID;
    Spreadsheet = SpreadsheetApp.openById(ssid);
    if (!initiateParam) {
      return;
    }
    ignoreEmpty = initiateParam.ignoreEmpty ? true : false;
  }

  function ParametersObj(param) {
    var self = this;
    this.sheetName = param.sheetName;
    this.Sheet = Spreadsheet.getSheetByName(param.sheetName);
    var rangesOptionsArray = param.rangesOptionsArray || DEFAULT_RANGES_OPTIONS_ARRAY;
    this.rangesOptionsArray = rangesOptionsArray.map(rngParam => new RangeOptionsObj(rngParam, self.Sheet));
  }

  function RangeOptionsObj(rngParam, Sheet) {
    var self = this;
    this.type = DEFAULT_TYPE;
    this.cols = 1;
    this.rows = Sheet.getLastRow();
    Object.assign(this, rngParam);
    if (this.definedRangeName) {
      this.defaultRange = Sheet.getRange(this.definedRangeName);
      this.values = this.defaultRange.getValues();
      if (this.values.length > 1 || this.values[0] > 1) {
        this.rows = this.rows || this.values.length;
        this.cols = this.cols || this.values[0].length;
      }
      this.startRow = this.defaultRange.getRow();
      this.startCol = this.defaultRange.getColumn();
    }
    this.defaultRange = this.defaultRange || Sheet.getRange(this.startRow, this.startCol, this.rows, this.cols);
    this.value = this.defaultRange.getValue();
    this.values = this.values || this.defaultRange.getValues();
  }

  function InterfaceSheetObj(Sheet, paramObj) {
    var self = this;
    this.Sheet = Sheet;
    this.rangesObj = {};
    this.allObjectifiedValues = {};
    this.allClearRanges = [];
    this.clearSheet = function () {
      clearAllRanges(self.allClearRanges)
      return self;
    }
    paramObj.rangesOptionsArray.forEach((rangeOptions, i) => {
      if (!rangeOptions.type) {
        console.log("No type for range: " + Sheet.getName() + " Range " + i + 1);
        return
      }
      var rangeObj = new ISMFMethods[rangeOptions.type](rangeOptions, Sheet);
      var rangeName = rangeOptions.rangeName || generateRangeName(this.rangesObj, rangeOptions.type);
      self.rangesObj[rangeName] = rangeObj;
      Object.assign(self.allObjectifiedValues, rangeObj.objectifiedValues);
      self.allClearRanges = self.allClearRanges.concat(rangeObj.clearRanges);
    })
  }


  var ISMFMethods = {
    TableRange: function (rangeOptions, Sheet) {
      this.rangeRepeats = 1;
      Object.assign(this, rangeOptions);
      var self = this;
      var valuesArray = rangeOptions.transpose ? transpose(rangeOptions.values) : rangeOptions.values;
      this.userHeader = valuesArray.shift();
      this.header = valuesArray.shift();
      var clearPrefArr = this.clearPref ? valuesArray.shift() : [];
      var requiredRange = this.requiredArray ? valuesArray.shift() : [];
      var rangesListAnn = [];
      this.rangeRepeat = this.indexOn ? this.rangeRepeats : 1;
      this.valuesColOffset = valuesArray.length - this.rangeRepeats; //CHECK!
      this.values = valuesArray.slice(this.valuesColOffset); //CHECK!
      this.clearRanges = [];
      this.rangeVariablesObjArr = getTableRangeObjByHeader();
      this.objectifiedValues = new AutoIndexedValues();
      this.indexedValues = [];
      this.rangeList = Sheet.getRangeList(rangesListAnn);
      this.clearRange = function () {
        self.rangeList.clearContent();
        return this;
      }
      this.setRange = function () {

      }
      this.indexValues = function (indexOn) {
        self.indexOn = self.indexOn ? self.indexOn : indexOn;
        if (!self.indexOn) {
          console.log("No indexing paramter provided");
          return;
        }
        self.indexedValues = new IndexedObjectifiedValues(self.rangeVariablesObjArr, self.indexOn);
      }
      function getTableRangeObjByHeader() {
        var rangeVariablesObjArr = [];
        self.values.forEach((row, i) => {
          var obj = {};
          row.forEach((col, j) => {
            if (col == "" && ignoreEmpty) {
              return;
            }
            var rangeVariablesObj = new RangeVariablesObj(col, i, j);
            Object.assign(obj, rangeVariablesObj);
          })
          rangeVariablesObjArr.push(obj);
        })

        function RangeVariablesObj(col, i, j) {
          var rowInSheet = self.startRow + j;
          var colInSheet = self.startCol + self.valuesColOffset + i;
          var rangeInSheet = Sheet.getRange(rowInSheet, colInSheet);
          var annotation = rangeInSheet.getA1Notation();
          var header = self.header;
          rangesListAnn.push(annotation);
          var rowClearPref = clearPrefArr[j];
          if (!rowClearPref || rowClearPref == "") {
            self.clearRanges.push(rangeInSheet);
          }
          if (header[j] == "") {
            return
          }
          this[header[j]] = {};
          this[header[j]].userHeader = self.userHeader[j];
          this[header[j]].value = col
          this[header[j]].rowInSheet = rowInSheet;
          this[header[j]].rangeInSheet = rangeInSheet;
          this[header[j]].isEmpty = col == "" ? true : false;
        };
        return rangeVariablesObjArr;
      }

      function AutoIndexedValues() {
        var indexObj = this;
        self.rangeVariablesObjArr.forEach(rangeVariables => {
          var indexingValue = self.indexOn ? rangeVariables[self.indexOn].value + "_" : "";
          Object.keys(rangeVariables).forEach(key => {
            indexObj[indexingValue + key] = rangeVariables[key];
          })
        })
      }

    },
    OnTopRange: function (rangeOptions, Sheet) {
      Object.assign(this, rangeOptions);
      var self = this;
      var rangesListAnn = [];
      this.clearRanges = [];
      this.objectifiedValues = new OnTopRangeObjValues();
      this.rangeList = Sheet.getRangeList(rangesListAnn);
      this.clearRange = function () {
        self.rangeList.clearContent();
        return self;
      }
      function OnTopRangeObjValues() {
        var onTopObj = this;
        self.values.forEach((row, i, arr) => {
          var headerIndicator = row[0];
          var header = row[1];
          var userHeader = row[2];
          var valueCell = arr[i + 1][1];
          if (headerIndicator != "header" || (valueCell == "" && ignoreEmpty)) {
            return
          }
          var rangeInSheet = Sheet.getRange(self.startRow + i + 1, self.startCol + 1);
          self.clearRanges.push(rangeInSheet);
          var annotation = rangeInSheet.getA1Notation();
          rangesListAnn.push(annotation);
          onTopObj[header] = {};
          onTopObj[header].userHeader = userHeader;
          onTopObj[header].value = valueCell;
          onTopObj[header].isEmpty = valueCell == "" ? true : false;

        })
      }

    },
    SkipRange: function (rangeOptions, Sheet) {
      Object.assign(this, rangeOptions);
      var self = this;
      var rangesListAnn = [];
      this.clearRanges = [];
      this.objectifiedValues = new SkipRangeObjValues();
      this.rangeList = Sheet.getRangeList(rangesListAnn);
      this.clearRange = function () {
        rangeList.clearContent();
        return self;
      }
      function SkipRangeObjValues() {
        var skipRangeObj = this;
        var values = self.values;
        var skip = self.skip;
        var lengthOfValues = values.length;
        var counter;
        var key;
        for (let i = 0; i < lengthOfValues; i++) {
          if (i % skip == 0) {
            counter = 0;
            key = values[i][0];
            var userHeader = values[i][1];
            skipRangeObj[key] = {};
            skipRangeObj[key].userHeader = userHeader;
            counter++
          } else if (counter == 1) {
            var value = values[i][0];
            skipRangeObj[key].value = value;
            skipRangeObj[key].isEmpty = value == "" ? true : false;
            var rangeInSheet = Sheet.getRange(self.startRow + i, self.startcol);
            self.clearRanges.push(rangeInSheet);
            var annotation = rangeInSheet.getA1Notation();
            rangesListAnn.push(annotation);
            counter = 0;
          }
        }
      }
    },
    ListRange: function (rangeOptions, Sheet) {
      Object.assign(this, rangeOptions);
      var self = this;
      var rangesListAnn = [];
      this.clearRanges = [];
      this.objectifiedValues = new ListRangeObjValues();
      this.rangeList = Sheet.getRangeList(rangesListAnn);
      this.clearRange = function () {
        self.rangeList.clearContent();
        return self;
      }
      function ListRangeObjValues() {
        var values = self.values;
        var headerRow = self.values.shift()
        var userHeader = headerRow[0];
        var header = headerRow[1];
        var listArray = values.map(row => {
          return row[0];
        })
        var filteredArray = listArray.filter(row => row != "");
        if (filteredArray.length == 0 && ignoreEmpty) {
          return;
        }
        var rangeInSheet = Sheet.getRange(self.startRow + 1, self.startCol, self.rows - 1, 1);
        self.clearRanges.push(rangeInSheet);
        var annotation = rangeInSheet.getA1Notation();
        rangesListAnn.push(annotation);
        this[header] = {}
        this[header].userHeader = userHeader
        this[header].value = filteredArray;
        this[header].isEmpty = filteredArray.length == 0 ? true : false;
      }
    },

    DefinedRange: function (rangeOptions, Sheet) {
      if (rangeOptions.value == "" && ignoreEmpty) {
        return;
      }
      Object.assign(this, rangeOptions);
      var self = this;
      this.clearRanges = [self.defaultRange];
      this.objectifiedValues = new DefinedRangeObj();
      this.clearRange = function () {
        self.defaultRange.clearContent();
        return self;
      }
      function DefinedRangeObj() {
        this[definedRangeName] = {};
        this[definedRangeName].userHeader = definedRangeName;
        this[definedRangeName].value = self.value;
        this[definedRangeName].isEmpty = self.value == "" ? true : false;
      }
    }
  }

  function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
  }

  function IndexedObjectifiedValues(objectifiedValues, indexOn) {
    var self = this;
    objectifiedValues.forEach(variablesObj => {
      var indexingValue = variablesObj[indexOn].value;
      if (!indexingValue) {
        return;
      }
      self[indexingValue] = variablesObj;
    })
  }

  function clearAllRanges(clearRangesArr) {
    clearRangesArr.forEach(range => {
      range.clearContent();
    })
  }

  function generateRangeName(rangesObj, rangeType) {
    var rangeTypeRanges = rangesObj[rangeType];
    if (!rangeTypeRanges) {
      return rangeType + "_1"
    }
    var rangeNames = Object.keys(rangeTypeRanges);
    var pattern = /_[0-9]+/
    var rangesWithCount = rangeNames.filter(rangeName => {
      return pattern.test(rangeName);
    })
    var rangeCount = parseInt(rangesWithCount.slice(-1)[0].split("_")[1]) + 1;
    return rangeType + rangeCount;
  }



  ISMF.init = init;

  return ISMF
})

function testGetValuesFromSheetMSM() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssid = ss.getId();
  // var sheetName = ss.getActiveSheet().getName();
  const INTROS_SHEETNAME = "Introductions & Visions";
  var param = {
    sheetName: INTROS_SHEETNAME,
    rangesOptionsArray: [
      {
        rangeName: "introsRangeParam",
        type: "OnTopRange",
        startRow: 5,
        startCol: 1,
        cols: 3
      },
      {
        rangeName: "visionsRangeParam",
        type: "OnTopRange",
        startRow: 5,
        startCol: 7,
        cols: 3
      },
      {
        rangeName: "otherInfoRangeParam",
        type: "VerticalRange",
        startRow: 5,
        startCol: 14,
        cols: 3
      }
    ]
  }

  var ismObj = ISMF.init(ssid).readInterfaceSheet(param);
  var introSheetInterface = ismObj.interfaceSheetsObj[INTROS_SHEETNAME];
  introSheetInterface.clearSheet();
}
