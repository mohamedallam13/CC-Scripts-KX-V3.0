; (function (root, factory) {
  root.ISMF = factory()
})(this, function () {

  // Version 1

  const ISMF = {};

  var Spreadsheet
  var Sheet

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
        var rangeObj = ISMFMethods[paramObj.type](paramObj, this);
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
      verticalRanges: function (paramObj, ismObj) {
        var rangeObj = {};
        var transposedArray = transpose(paramObj.values);
        var usersHeader = transposedArray.shift();
        var header = transposedArray.shift();
        if (paramObj.clearPref) {
          var clearPrefArr = transposedArray.shift();
          getVerticalClearRanges(clearPrefArr, paramObj.startRow, paramObj.startCol, ismObj)
        }
        var valuesArr = transposedArray[transposedArray.length - 1];
        valuesArr.forEach((col, j) => {
          if(col == ""){
            return;
          }
          rangeObj[header[j]] = {};
          rangeObj[header[j]].userHeader = usersHeader[j];
          rangeObj[header[j]].value = col
          rangeObj[header[j]].rowInSheet = paramObj.startRow + j;
        })
        return rangeObj;
      },
      onTopRanges: function (paramObj, ismObj) {
        var rangeObj = {};
        var values = paramObj.values;
        values.forEach((row, i, arr) => {
          if (row[0] == "header") {
            rangeObj[row[1]] = {};
            rangeObj[row[1]].userHeader = row[2];
            rangeObj[row[1]].value = arr[i + 1][1];
            var range = Sheet.getRange(paramObj.startRow + i, paramObj.startCol);
            ismObj.clearRangesArr.push(range);
            addToClearRangesByType(range, paramObj.type, ismObj);
          }
        })
        return rangeObj;
      },
      skipRanges: function (paramObj, ismObj) {
        var rangeObj = {};
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
      listRanges: function (paramObj, ismObj) {
        var rangeObj = {};
        var values = paramObj.values;
        var headerRow = values.shift()
        var userHeader = headerRow[0];
        var header = headerRow[1];
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
      definedRanges: function (paramObj, ismObj) {
        var rangeObj = {};
        rangeObj.value = paramObj.value;
        rangeObj.userHeader = paramObj.userHeader;
        addToClearRangesByType(paramObj.range, paramObj.type, ismObj)
        return rangeObj;
      }
    }

    function getSheet(ssid, sheetName) {
      Spreadsheet = SpreadsheetApp.openById(ssid)
      Sheet = Spreadsheet.getSheetByName(sheetName)
    }

    function ParametersObj(param) {
      var range;
      this.type = param.type;
      if (param.definedRangeName) {
        this.definedRangeName = definedRangeName;
        range = Sheet.getRange(param.definedRangeName);
        this.startRow = range.getRow();
        this.startCol = range.getColumn();
      } else {
        this.startRow = param.startRow;
        this.startCol = param.startCol;
      }
      this.cols = param.cols || 1;
      this.rows = param.rows || Sheet.getLastRow();
      this.rangeName = param.rangeName;
      this.clearDef = param.clearDef;
      this.outputRange = param.outputRange;
      this.range = range || Sheet.getRange(this.startRow, this.startCol, this.rows, this.cols);
      this.value = this.range.getValue();
      this.values = this.range.getValues();
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

  ISMF.createInterfaceSheetManager = createInterfaceSheetManager;

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
