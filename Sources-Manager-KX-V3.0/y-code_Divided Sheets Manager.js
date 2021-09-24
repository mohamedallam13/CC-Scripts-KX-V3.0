; (function (root, factory) {
  root.DIVIDED_SHEETS_MANAGER = factory()
})(this, function () {

  const DIVIDED_SHEETS_MANAGER = {}

  const DEFAULT_SSID = "10X1A0sf3BDoqvlkNSSw3SViNkvrLwacZANyRvUA0ThY";
  const DEFAULT_DIVIDER = "";

  const DEFAULT_RANGES_OPTIONS_ARRAY = [
    {
      marker: "#",
      tableLabel: "sources",
      type: ""
    },
    {
      marker: "Base_Source",
      tableLabel: "maps",
      transpose: true,
      type: ""
    }
  ]

  var divider;
  var rangesOptionsArray;

  function getSpreadSheetObj(ssid) {
    SpreadsheetApp.flush();
    var ssid = ssid || DEFAULT_SSID;
    var spreadSheetObj = {
      Spreadsheet: SpreadsheetApp.openById(ssid),
      sheetsObject: {},
      readSourcesSheet: function (sheetName) {
        rangesOptionsArray = rangesOptionsArray || DEFAULT_RANGES_OPTIONS_ARRAY;
        divider = divider || DEFAULT_DIVIDER
        var Sheet = this.Spreadsheet.getSheetByName(sheetName);
        var dataRegionValues = Sheet.getDataRange().getValues();
        var startCoordinates = getFirstTableHeader(dataRegionValues);
        var subTablesObj = getSplitArrays(dataRegionValues, startCoordinates);
        this.sheetsObject[sheetName] = {
          Sheet: Sheet,
          subTablesObj: subTablesObj
        }
        return this;
      }
    };
    return spreadSheetObj;
  }

  function getFirstTableHeader(dataRegionValues) {
    for (var i = 0; i < dataRegionValues.length; i++) {
      var row = dataRegionValues[i];
      var firstTableMarker = rangesOptionsArray[0].marker;
      var markerIndex = row.indexOf(firstTableMarker);
      if (markerIndex != -1) {
        return { rowIndex: i, colIndex: markerIndex }
      }
    }
  }

  function getSplitArrays(dataRegionValues, startCoordinates) {
    var startRowIndex = startCoordinates.rowIndex;
    var startColIndex = startCoordinates.colIndex;
    var iterationHeader = getIterationHeader(dataRegionValues, startRowIndex, startColIndex);
    var subTablesObj = {};
    iterationHeader.forEach((col, j) => {
      if (col != divider) {
        return
      }
      var subTableArray = extractSubTable(dataRegionValues, startRowIndex, startColIndex, j);
      var rangeOptions = new RangeOptionsObj(subTableArray, startRowIndex, startColIndex, j);
      addToSubTablesObj(subTablesObj, subTableArray, rangeOptions);
      startColIndex = j + 1;
    })
    return subTablesObj;
  }

  function getIterationHeader(dataRegionValues, startRowIndex, startColIndex) {
    var iterationHeader = dataRegionValues[startRowIndex].slice(startColIndex)
    iterationHeader.push(divider);
    //adding a divider cell at the end to iterate over it and maintain the j count with no extra conditions;
    return iterationHeader;
  }

  function extractSubTable(dataRegionValues, startRowIndex, startColIndex, endColIndex) {
    var subTableArray = [];
    var tablesRegionValues = dataRegionValues.slice(startRowIndex);
    for (let i = 0; i < tablesRegionValues.length; i++) {
      var row = tablesRegionValues[i];
      if (row[startColIndex] == "") {
        return subTableArray;
      }
      var slicedRow = row.slice(startColIndex, endColIndex);
      subTableArray.push(slicedRow);
    }
  }

  function RangeOptionsObj(subTableArray, startRowIndex, startColIndex, j) {
    this.startRow = startRowIndex + 1;
    this.startCol = startColIndex + 1;
    this.lastRow = subTableArray.length - startRowIndex;
    this.endCol = j;
  }

  function addToSubTablesObj(subTablesObj, subTableArray, rangeOptions) {
    var markerInSheet = subTableArray[0][0];
    var defaultRangeOptions = checkInArray(rangesOptionsArray, "marker", markerInSheet);
    if (!defaultRangeOptions) {
      return;
    }
    Object.assign(rangeOptions, defaultRangeOptions)
    var tableLabel = rangeOptions.tableLabel
    subTablesObj[tableLabel] = new SubTableObj(rangeOptions, subTableArray);
  }

  function checkInArray(obj, searchField, itemToSearch) {
    return obj.filter(row => row[searchField] == itemToSearch)[0];
  }

  function SubTableObj(rangeOptions, subTableArray) {
    this.values = rangeOptions.transpose ? transpose(subTableArray) : subTableArray;
    var objValuesObj = objectifyValues(this.values, rangeOptions);
    Object.assign(this, objValuesObj, rangeOptions);
  }

  function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
  }

  function objectifyValues(values, rangeOptions) {
    var objectifiedValues = [];
    var header = values[0];
    values = values.slice(1);
    values.forEach((row, i) => {
      var obj = {};
      header.forEach((col, j) => {
        obj[col] = row[j];
      })
      if (rangeOptions.transpose) {
        obj.orderInSheet = rangeOptions.startCol + i + 1;
      } else {
        obj.orderInSheet = rangeOptions.startRow + i + 1;
      }
      objectifiedValues.push(obj);
    })
    return { header: header, objectifiedValues: objectifiedValues }
  }

  DIVIDED_SHEETS_MANAGER.getSpreadSheetObj = getSpreadSheetObj;

  return DIVIDED_SHEETS_MANAGER

})

function testSheetReader() {
  var reader = DIVIDED_SHEETS_MANAGER.getSpreadSheetObj().readSourcesSheet("CCG").sheetsObject;
}

