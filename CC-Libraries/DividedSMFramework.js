; (function (root, factory) {
  root.DSMF = factory()
})(this, function () {

  const DSMF = {}

  const DEFAULT_SSID = "";
  const DEFAULT_DIVIDER = ""; // What Divides the tables (could be an emtpy cell, or any sort of divider like a cell including a certain value)
  const DEFAULT_TYPE = ""; // I cant remember what the fuck that was even

  const DEFAULT_RANGES_OPTIONS_ARRAY = [
    {
      marker: "",
      tableLabel: "",
      transpose: true, // Should the table be transposed, so the headers are currently actually a column not a row
      type: ""
    }
  ]

  var Spreadsheet;

  function init(ssid) {
    initiateSpreadSheet(ssid);
    const dividedSheetManager = {
      Spreadsheet: Spreadsheet,
      dividedSheetsObject: {},
      readDividedSheet: function (param) {
        var paramObj = new ParametersObj(Spreadsheet, param);
        this.dividedSheetsObject[paramObj.sheetName] = new DividedSheetObj(paramObj);
        return this;
      }
    };
    return dividedSheetManager;
  }

  function initiateSpreadSheet(ssid) {
    SpreadsheetApp.flush();
    ssid = ssid || DEFAULT_SSID;
    Spreadsheet = SpreadsheetApp.openById(ssid);
  }
  function ParametersObj(Spreadsheet, param) {
    this.sheetName = param.sheetName;
    this.Sheet = Spreadsheet.getSheetByName(param.sheetName);
    this.divider = param.divider || DEFAULT_DIVIDER;
    var rangesOptionsArray = param.rangesOptionsArray || DEFAULT_RANGES_OPTIONS_ARRAY;
    this.sheetProps = new SheetProps(this.Sheet, rangesOptionsArray, this.divider);
    this.rangesOptionsArray = rangesOptionsArray.map((rngParam, i) => {
      var tableObj = this.sheetProps.extractedTables[i];
      return new RangeOptionsObj(rngParam, this.Sheet, tableObj);
    })
  }

  function SheetProps(Sheet, rangesOptionsArray, divider) {
    const self = this;
    this.dataRegionValues = Sheet.getDataRange().getValues();
    this.extractedTables = extractTables(this.dataRegionValues, rangesOptionsArray, divider);
  }

  function extractTables(dataRegionValues, rangesOptionsArray, divider) {
    var firstTableMarker = rangesOptionsArray[0].marker;
    var startCoord = getStartCoordinates(dataRegionValues, firstTableMarker);
    var iterationHeader = getIterationHeader(dataRegionValues, startCoord.rowIndex, startCoord.colIndex, divider);
    var localStartColIndex = startCoord.colIndex;
    var extractedTables = [];
    iterationHeader.forEach((col, j) => {
      if (col != divider) {
        return
      }
      var extractedTable = extractSubTable(dataRegionValues, startCoord.rowIndex, localStartColIndex, j);
      var extractedTableOptions = new TableOptionsObj(extractedTable, startCoord.rowIndex, localStartColIndex, j);
      extractedTables.push({ extractedTable: extractedTable, extractedTableOptions: extractedTableOptions });
      localStartColIndex = j + 1;
    })
    return extractedTables;
  }

  function getStartCoordinates(dataRegionValues, firstTableMarker, sheetProps) {
    var startCoord = {};
    for (var i = 0; i < dataRegionValues.length; i++) {
      var row = dataRegionValues[i];
      var markerIndex = row.indexOf(firstTableMarker);
      if (markerIndex != -1) {
        startCoord.rowIndex = i;
        startCoord.colIndex = markerIndex;
        return startCoord;
      }
    }
  }

  function getIterationHeader(dataRegionValues, startRowIndex, startColIndex, divider) {
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

  function TableOptionsObj(subTableArray, startRowIndex, startColIndex, j) {
    this.startRow = startRowIndex + 1;
    this.startCol = startColIndex + 1;
    this.lastRow = subTableArray.length - startRowIndex;
    this.lastCol = j;
  }

  function RangeOptionsObj(rngParam, Sheet, tableObj) {
    this.type = DEFAULT_TYPE;
    Object.assign(this, tableObj.extractedTableOptions, rngParam);
    var self = this;
    this.values = this.transpose ? transpose(tableObj.extractedTable) : tableObj.extractedTable;
    this.rows = this.lastRow - this.startRow + 1;
    this.cols = this.lastCol - this.startCol + 1;
    this.range = Sheet.getRange(this.startRow, this.startCol, this.rows, this.cols);
  }

  function DividedSheetObj(paramObj) {
    this.Sheet = paramObj.Sheet;
    // this.subTablesObj = getSubTableObj(this.Sheet, paramObj.rangesOptionsArray, paramObj.divider);
    this.subTablesObj = {};
    paramObj.rangesOptionsArray.forEach(rangeOptions => {
      var tableLabel = rangeOptions.tableLabel || rangeOptions.marker
      var subTable = new SubTableObj(rangeOptions);
      this.subTablesObj[tableLabel] = subTable;
    })
  }

  function SubTableObj(rangeOptions) {
    var objValuesObj = objectifyValues(rangeOptions);
    Object.assign(this, objValuesObj, rangeOptions);
  }

  function transpose(matrix) {
    return matrix[0].map((col, i) => matrix.map(row => row[i]));
  }

  function objectifyValues(rangeOptions) {
    var values = rangeOptions.values;
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

  DSMF.init = init;

  return DSMF

})

function testSheetReader() {
  const SSID = "10X1A0sf3BDoqvlkNSSw3SViNkvrLwacZANyRvUA0ThY";
  const SHEET_OPTIONS_ARRAY = [

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
  var reader = DSMF.init(SSID).readDividedSheet({ sheetName: "CCG", rangesOptionsArray: SHEET_OPTIONS_ARRAY }).dividedSheetsObject;
}

