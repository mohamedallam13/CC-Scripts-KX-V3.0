; (function (root, factory) {
  root.ISMF = factory()
})(this, function () {

  // Version 2

  const ISMF = {};

  const DEFAULT_SSID = "";
  const DEFAULT_RANGES_OPTIONS_ARRAY = [];
  const DEFAULT_TYPE = "";

  var Spreadsheet

  function init(ssid) {
    initiateSpreadSheet(ssid);
    const InterfaceSheetManager = {
      Spreadsheet: Spreadsheet,
      interfaceSheetsObj: {},
      allObjectifiedValues: {},
      allClearRanges: {},
      readInterfaceSheet: function (param) {
        var paramObj = new ParametersObj(param);
        var Sheet = this.Spreadsheet.getSheetByName(paramObj.sheetName);
        this.interfaceSheetsObj[sheetName] = new InterfaceSheetObj(Sheet, paramObj, this);
        return this;
      }
    };
    return InterfaceSheetManager;
  }

  function initiateSpreadSheet(ssid) {
    SpreadsheetApp.flush();
    ssid = ssid || DEFAULT_SSID;
    Spreadsheet = SpreadsheetApp.openById(ssid);
  }

  function ParametersObj(Spreadsheet, param) {
    this.sheetName = param.sheetName;
    this.Sheet = Spreadsheet.getSheetByName(param.sheetName);
    var rangesOptionsArray = param.rangesOptionsArray || DEFAULT_RANGES_OPTIONS_ARRAY;
    this.rangesOptionsArray = rangesOptionsArray.map(rngParam => new RangeOptionsObj(rngParam, Sheet));
  }

  function RangeOptionsObj(rngParam, Sheet) {
    this.type = DEFAULT_TYPE;
    this.cols = 1;
    this.rows = Sheet.getLastRow();
    Object(this, rngParam);
    if (this.definedRangeName) {
      this.defaultRange = Sheet.getRange(this.definedRangeName);
      this.startRow = defaultRange.getRow();
      this.startCol = defaultRange.getColumn();
    }
    this.defaultRange = Sheet.getRange(this.startRow, this.startCol, this.rows, this.cols);
    this.value = this.defaultRange.getValue();
    this.values = this.defaultRange.getValues();
  }

  function InterfaceSheetObj(Sheet, paramObj, ismObj) {
    this.Sheet = Sheet;
    this.rangesObj = {};
    paramObj.rangesOptionsArray.forEach(rangeOptions => {
      var rangeObj = ISMFMethods[rangeOptions.type](rangeOptions, Sheet, ismObj);
      var rangeName = paramObj.rangeName || generateRangeName(this.rangesObj, rangeOptions.type);
      this.rangesObj[rangeName] = rangeObj;
    })
  }

  function createInterfaceSheetManager(ssid, sheetName) {

    getSheet(ssid, sheetName);

    const InterfaceSheetManager = {

      Spreadsheet: Spreadsheet,
      Sheet: Sheet,
      rangesObj: {},
      aggregateObj: {},
      clearRangeByType: {},
      clearRangesArr: [],

      getRangeData: function (param) {
        if (!param.type) {
          console.log("No Type is Provided");
          return
        }
        var paramObj = new ParametersObj(param);
        var rangeObj = new ISMFMethods[paramObj.type](paramObj);
        Object.assign(this.aggregateObj, rangeObj);
        var rangeName = paramObj.rangeName || generateRangeName(this.rangesObj, paramObj.type);
        addToRangesObj(rangeObj, paramObj.type, rangeName, this);
        return this;
      },
      clearRangeByType: function (type) {
        if (this.clearRangeByType[type]) {
          this.clearRangeByType[type].forEach(range => {
            range.clearContent();
          })
        }
        return this;
      },
      clearAllRanges: function () {
        this.clearRangesArr.forEach(range => {
          range.clearContent();
        })
        return this;
      }
    }

    var ISMFMethods = {
      VerticalRange: function (rangeOptions, Sheet, ismObj) {
        this.rangeRepeats = 1;
        Object.assign(this, rangeOptions);
        var self = this;
        var transposedArray = transpose(rangeOptions.values);
        var clearPrefArr = this.clearPref ? transposedArray.shift() : [];
        var rangesListAnn = [];
        this.rangeRepeat = this.indexOn ? this.rangeRepeats : 1;
        this.valuesColOffset = transposedArray.length - this.rangeRepeats;
        this.usersHeader = transposedArray.shift();
        this.header = transposedArray.shift();
        this.values = transposedArray.slice(transposedArray.length - this.rangeRepeats);
        this.clearRanges = [];
        this.rangeVariablesObjArr = new VerticalRangeObjByHeader();
        this.objectifiedValues = new AutoIndexedValues();
        this.indexedValues = [];
        this.rangeList = Sheet.getRangeList(rangesListAnn);
        this.clearRange = function () {
          rangeList.clearContent();
          return this;
        }
        this.setRange = function () {

        }
        this.indexValues = function () {
          self.indexedValues = new IndexedObjectifiedValues(self.rangeVariablesObjArr);
        }
        function VerticalRangeObjByHeader() {
          var rangeVariablesObjArr = [];
          self.values.forEach((row, i) => {
            row.forEach((col, j) => {
              if (col == "") {
                return;
              }
              var rangeVariablesObj = new RangeVariablesObj(row, col, i, j);
              rangeVariablesObjArr.push(rangeVariablesObj)
            })
          })

          function RangeVariablesObj(col, i, j) {
            var rowInSheet = self.startRow + j;
            var colInSheet = self.startCol + self.valuesOffset + i;
            var rangeInSheet = Sheet.getRange(rowInSheet, colInSheet);
            var annotation = rangeInSheet.getA1Notation();
            var header = self.header;
            self.rangesListAnn.push(annotation);
            var rowClearPref = clearPrefArr[j];
            if (!rowClearPref || rowClearPref == "") {
              self.clearRanges.push(rangeInSheet);
            }
            this[header[j]] = {};
            this[header[j]].userHeader = self.userHeader[j];
            this[header[j]].value = col
            this[header[j]].rowInSheet = rowInSheet;
            this[header[j]].rangeInSheet = rangeInSheet;
          };
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
      OnTopRange: function (rangeOptions, ismObj) {
        Object.assign(this, rangeOptions);
        var self = this;
        var rangesListAnn = [];
        this.objectifiedValues = new OnTopRangeObjValues();
        this.rangeList = Sheet.getRangeList(rangesListAnn);
        this.clearRange = function () {
          rangeList.clearContent();
          return this;
        }
        function OnTopRangeObjValues() {
          var onTopObj = this;
          self.values.forEach((row, i, arr) => {
            if (row[0] != "header") {
              return
            }
            var rangeInSheet = Sheet.getRange(self.startRow + i, self.startCol);
            var annotation = rangeInSheet.getA1Notation();
            rangesListAnn.push(annotation);
            onTopObj[row[1]] = {};
            onTopObj[row[1]].userHeader = row[2];
            onTopObj[row[1]].value = arr[i + 1][1];

          })
        }

      },
      SkipRange: function (rangeOptions, ismObj) {
        Object.assign(this, rangeOptions);
        var self = this;
        var rangesListAnn = [];
        this.objectifiedValues = new SkipRangeObjValues();
        this.rangeList = Sheet.getRangeList(rangesListAnn);
        this.clearRange = function () {
          rangeList.clearContent();
          return this;
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
              var key = values[i][0];
              skipRangeObj[key] = {};
              skipRangeObj[key].userHeader = values[i][1];
              counter++
            } else if (counter == 1) {
              skipRangeObj[key].value = values[i][0];
              var rangeInSheet = Sheet.getRange(self.startRow + i, self.startcol);
              var annotation = rangeInSheet.getA1Notation();
              rangesListAnn.push(annotation);
              counter = 0;
            }
          }
        }
      },
      ListRange: function (rangeOptions, ismObj) {
        Object.assign(this, rangeOptions);
        var values = paramObj.values;
        var headerRow = this.values.shift()
        this.userHeader = headerRow[0];
        this.header = headerRow[1];
        var listArray = values.map(row => {
          return row[0];
        })
        rangeObj[header] = {}
        rangeObj[header].userHeader = userHeader
        rangeObj[header].value = listArray;
        var range = Sheet.getRange(paramObj.startRow + 1, paramObj.startCol, paramObj.rows - 1, 1);
        ismObj.clearRangesArr.push(range);
        addToClearRangesByType(range, paramObj.type, ismObj);
        return rangeObj;
      },
      DefinedRange: function (rangeOptions, ismObj) {
        Object.assign(this, rangeOptions);

        addToClearRangesByType(paramObj.range, paramObj.type, ismObj)
        return rangeObj;
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

    function addToRangesObj(rangeObj, type, rangeName, ismObj) {
      if (!ismObj.rangesObj[type]) {
        ismObj.rangesObj[type] = {};
      }
      ismObj.rangesObj[type][rangeName] = rangeObj
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

    return InterfaceSheetManager;
  }

  ISMF.init = init;

  return ISMF
})

function testGetValuesFromSheetMSM() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var ssid = ss.getId();
  var sheetName = ss.getActiveSheet().getName();
  var msm = montagSM(ssid, sheetName);
  var rangeBParameters = {
    startRow: 5,
    startCol: 1,
    cols: 2
  }
  msm.getOnTopRangeRange(rangeBParameters);
  var z
}
