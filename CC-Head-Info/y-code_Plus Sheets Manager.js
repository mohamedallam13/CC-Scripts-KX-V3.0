; (function (root, factory) {
  root.SHEETS_MANAGER = factory()
})(this, function () {

  var SHEETS_MANAGER = {};

  const SSID = "1VqDGZ4uLVxti6pRsYE9QRTZqlnpis619CgZSPLpNZH0";
  const INTROS_SHEETNAME = "Introductions & Visions";
  const PLATFORMDATA_SHEETNAME = "Social Platforms Data";
  const EXPORT_SHEETNAME = "Export Data";

  const ALL_INPUTS_SOURCES_ARRAY = [
    {
      sheetName: INTROS_SHEETNAME,
      ranges: [
        {
          rangeName: "introsRangeParam",
          type: "onTopRanges",
          startRow: 5,
          startCol: 1,
          cols: 3
        },
        {
          rangeName: "visionsRangeParam",
          type: "onTopRanges",
          startRow: 5,
          startCol: 7,
          cols: 3
        },
        {
          rangeName: "otherInfoRangeParam",
          type: "verticalRanges",
          startRow: 5,
          startCol: 14,
          cols: 3
        }
      ]
    },
    {
      sheetName: PLATFORMDATA_SHEETNAME,
      ranges: [
        {
          rangeName: "facebookInfoRange",
          type: "verticalRanges",
          startRow: 5,
          startCol: 1,
          cols: 3
        },
        {
          rangeName: "instagramInfoRange",
          type: "verticalRanges",
          startRow: 5,
          startCol: 5,
          cols: 3
        }
      ]
    },
    {
      sheetName: EXPORT_SHEETNAME,
      ranges: [
        {
          rangeName: "emailInfoRange",
          type: "verticalRanges",
          startRow: 5,
          startCol: 2,
          cols: 3,
          rows: 2
        },
        {
          rangeName: "emailsListRange",
          type: "listRanges",
          startRow: 8,
          startCol: 2,
          cols: 2,
          rows: 4
        },
        {
          rangeName: "emailsBodyRange",
          type: "onTopRanges",
          startRow: 14,
          startCol: 1,
          cols: 3
        }
      ]
    }
  ]

  function extractAllInputs() {
    var inputsObj = {};
    ALL_INPUTS_SOURCES_ARRAY.forEach(sheetInfoObj => {
      var ismObj = ISMF.createInterfaceSheetManager(SSID, sheetInfoObj.sheetName);
      sheetInfoObj.ranges.forEach(rangeParam => {
        ismObj.getRangeData(rangeParam);
      });
      sheetInfoObj.ismObj = ismObj;
      Object.assign(inputsObj, sheetInfoObj.ismObj.aggregateObj);
    })
    return inputsObj;
  }

  SHEETS_MANAGER.extractAllInputs = extractAllInputs;
  return SHEETS_MANAGER
})

function testExtractAll() {
  var inputsObj = SHEETS_MANAGER.extractAllInputs();
  var t
}