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
          type: "TableRange",
          transpose: true,
          startRow: 5,
          startCol: 14,
          cols: 3
        }
      ]
    },
    {
      sheetName: PLATFORMDATA_SHEETNAME,
      rangesOptionsArray: [
        {
          rangeName: "facebookInfoRange",
          type: "TableRange",
          transpose: true,
          startRow: 5,
          startCol: 1,
          cols: 3
        },
        {
          rangeName: "instagramInfoRange",
          type: "TableRange",
          transpose: true,
          startRow: 5,
          startCol: 5,
          cols: 3
        }
      ]
    },
    {
      sheetName: EXPORT_SHEETNAME,
      rangesOptionsArray: [
        {
          rangeName: "emailInfoRange",
          type: "TableRange",
          transpose: true,
          startRow: 5,
          startCol: 2,
          cols: 3,
          rows: 2
        },
        {
          rangeName: "emailsListRange",
          type: "ListRange",
          startRow: 8,
          startCol: 2,
          cols: 2,
          rows: 4
        },
        {
          rangeName: "emailsBodyRange",
          type: "OnTopRange",
          startRow: 14,
          startCol: 1,
          cols: 3
        }
      ]
    }
  ]

  function extractAllInputs() {
    var ismObj = ISMF.init(SSID);
    ALL_INPUTS_SOURCES_ARRAY.forEach(rangeParam => {
      ismObj.readInterfaceSheet(rangeParam);
    })
    var inputsObj = ismObj.allObjectifiedValues;
    return inputsObj
  }

  SHEETS_MANAGER.extractAllInputs = extractAllInputs;
  return SHEETS_MANAGER
})

function testExtractAll() {
  var inputsObj = SHEETS_MANAGER.extractAllInputs();
}