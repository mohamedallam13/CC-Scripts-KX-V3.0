; (function (root, factory) {
  root.DSMF = factory()
})(this, function () {

  const DSMF = {}

  const DEFAULT_SSID = "";
  const DEFAULT_DIVIDER = "";

  const DEFAULT_RANGES_OPTIONS_ARRAY = [
    {
      marker: "",
      tableLabel: "",
      transpose: true,
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
        this.dividedSheetsObject[sheetName] = new DividedSheetObj(paramObj);
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
    this.Sheet = Spreadsheet.getSheetByName(paramObj.sheetName);
    this.divider = param.divider || DEFAULT_DIVIDER;
    var rangesOptionsArray = param.rangesOptionsArray || DEFAULT_RANGES_OPTIONS_ARRAY;
    this.sheetProps = new SheetProps(Sheet, rangesOptionsArray, divider);
    this.rangesOptionsArray = rangesOptionsArray.map(rngParam => new RangeOptionsObj(rngParam, this.Sheet, this.sheetProps));
  }

  function SheetProps(Sheet, rangesOptionsArray, divider) {
    this.dataRegionValues = Sheet.getDataRange().getValues();
    this.extractedTables = extractTables(this.dataRegionValues, rangesOptionsArray, divider);
  }

  function extractTables(dataRegionValues, rangesOptionsArray, divider) {
    var firstTableMarker = rangesOptionsArray[0].marker;
    var startCoord = getStartCoordinates(dataRegionValues, firstTableMarker);
    var iterationHeader = getIterationHeader(dataRegionValues, startCoord.rowIndex, startCoord.colIndex, divider);
    var localStartColIndex = sheetProp.rowIndex;
    var extractedTables = [];
    iterationHeader.forEach((col, j) => {
      if (col != divider) {
        return
      }
      var extractedTable = extractSubTable(dataRegionValues, localStartColIndex, startCoord.colIndex, j);
      var extractedTableOptions = new TableOptionsObj(subTableArray, startCoordinates.rowIndex, startCoordinates.colIndex, j);
      extractedTables.push({ extractedTable: extractedTable, extractedTableOptions: extractedTableOptions });
      startColIndex = j + 1;
    })
  }

  function getStartCoordinates(dataRegionValues, firstTableMarker, sheetProps) {
    for (var i = 0; i < dataRegionValues.length; i++) {
      var row = dataRegionValues[i];
      var markerIndex = row.indexOf(firstTableMarker);
      if (markerIndex != -1) {
        sheetProps.rowIndex = i;
        sheetProps.colIndex = markerIndex;
        return
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

  function RangeOptionsObj(rngParam, Sheet, sheetProps) {
    this.type = DEFAULT_TYPE;
    var marker = rngParam.marker;
    var tableObj = getTableFromExtracted(sheetProps, marker);
    Object(this, rngParam);
    this.values = this.transpose ? transpose(tableObj.extractedTable) : tableObj.extractedTable;
    this.rows = this.lastRow - this.startRow + 1;
    this.cols = this.lastCol - this.startCol + 1;
    this.range = Sheet.getRange(this.startRow, this.startCol, this.rows, this.cols);
  }
  function getTableFromExtracted(sheetProps, marker) {
    for (let i; i < sheetProps.extractedTables.length; i++) {
      var extractedTable = sheetProps.extractedTables[i].extractedTable;
      var markerInSheet = extractedTable[0][0];
      if (marker == markerInSheet) {
        return sheetProps.extractedTables[i];
      }
    }
  }

  function DividedSheetObj(Sheet, paramObj) {
    this.Sheet = paramObj.Sheet;
    this.subTablesObj = getSubTableObj(Sheet, paramObj.rangesOptionsArray, paramObj.divider);
    this.subTablesObj = {};
    paramObj.rangesOptionsArray.forEach(rangeOptions => {
      var tableLabel = rangeOptions.tableLabel || rangeOptions.marker
      var subTable = new SubTableObj(rangeOptions);
      this.subTablesObj[tableLabel] = subTable;
    })
  }

  function SubTableObj(rangeOptions) {
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

  DSMF.init = init;

  return DSMF

})

function testSheetReader() {
  var reader = DIVIDED_SHEETS_MANAGER.getSpreadSheetObj().readSourcesSheet("CCG").sheetsObject;
}

