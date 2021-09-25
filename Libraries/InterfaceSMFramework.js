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
      var rangeObj = ISMFMethods[rangeOptions.type](rangeOptions, ismObj);
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
      VerticalRange: function (rangeOptions, ismObj) {
        Object.assign(this, rangeOptions);
        var transposedArray = transpose(rangeOptions.values);
        this.usersHeader = transposedArray.shift();
        this.header = transposedArray.shift();
        this.values = transposedArray[transposedArray.length - 1];
        this.objectifiedValues = new VerticalRangeObjValues(this.values, this.header, this.usersHeader, this.startRow);
        if (rangeOptions.clearPref) {
          var clearPrefArr = transposedArray.shift();
          getVerticalClearRanges(clearPrefArr, rangeOptions.startRow, rangeOptions.startCol, ismObj)
        }
        this.clearRange = function () {

        }
        this.setRange = function () {

        }
        function VerticalRangeObjValues(values, header, userHeader, startRow) {
          values.forEach((col, j) => {
            if (col == "") {
              return;
            }
            this[header[j]] = {};
            this[header[j]].userHeader = userHeader[j];
            this[header[j]].value = col
            this[header[j]].rowInSheet = startRow + j;
          })
        }
      },
      OnTopRange: function (rangeOptions, ismObj) {
        Object.assign(this, rangeOptions);
        this.objectifiedValues = new OnTopRangeObjValues(this.values, this.startRow, this.startCol);

        this.OnTopRangeObjValues = function (values) {
          values.forEach((row, i, arr) => {
            if (row[0] == "header") {
              this[row[1]] = {};
              this[row[1]].userHeader = row[2];
              this[row[1]].value = arr[i + 1][1];


              var range = Sheet.getRange(paramObj.startRow + i, paramObj.startCol);
              ismObj.clearRangesArr.push(range);
              addToClearRangesByType(range, paramObj.type, ismObj);

            }
          })
        }

      },
      SkipRange: function (rangeOptions, ismObj) {
        Object.assign(this, rangeOptions);
        var values = paramObj.values;
        var skip = paramObj.skip;
        var lengthOfValues = values.length;
        var counter;
        var key;
        for (let i = 0; i < lengthOfValues; i++) {
          if (i % skip == 0) {
            counter = 0;
            var key = values[i][0];
            rangeObj[key] = {};
            rangeObj[key].userHeader = values[i][1];
            counter++
          } else if (counter == 1) {
            rangeObj[key].value = values[i][0];
            var range = Sheet.getRange(paramObj.startRow + i, paramObj.startcol);
            ismObj.clearRangesArr.push(range);
            addToClearRangesByType(range, paramObj.type, ismObj);
            counter = 0;
          }
        }
        return rangeObj;
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

    function getVerticalClearRanges(clearPrefArr, startRow, startCol, ismObj) {
      clearPrefArr.forEach((row, i) => {
        if (row != "def") {
          return;
        }
        var rowInd = startRow + i;
        var col = startCol + 2;
        var range = Sheet.getRange(rowInd, col)
        ismObj.clearRangesArr.push(range);
        addToClearRangesByType(range, type, ismObj);
      })
    }

    function addToClearRangesByType(range, type, ismObj) {
      if (!ismObj.clearRangeByType[type]) {
        ismObj.clearRangeByType[type] = [];
      }
      ismObj.clearRangeByType[type].push(range);
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
