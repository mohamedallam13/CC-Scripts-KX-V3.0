/*
; (function (root, factory) {
  root.SHEETS_MANAGER = factory()
})(this, function () {

  var SHEETS_MANAGER = {};

  const SSID = "1VqDGZ4uLVxti6pRsYE9QRTZqlnpis619CgZSPLpNZH0";
  const INTROS_SHEETNAME = "Introductions & Visions";
  const PLATFORMDATA_SHEETNAME = "Social Platforms Data";
  const EXPORT_SHEETNAME = "Export Data"

  const INPUT_RANGES = {
    introsRangeParam: {
      startRow: 5,
      startCol: 1,
      cols: 3
    },
    visionsRangeParam: {
      startRow: 5,
      startCol: 7,
      cols: 3
    },
    otherInfoRangeParam: {
      startRow: 5,
      startCol: 14,
      cols: 3
    },
    facebookInfoRange: {
      startRow: 5,
      startCol: 1,
      cols: 3
    },
    instagramInfoRange: {
      startRow: 5,
      startCol: 5,
      cols: 3
    },
    emailInfoRange: {
      startRow: 5,
      startCol: 2,
      cols: 3,
      rows: 2
    },
    emailsListRange: {
      startRow: 8,
      startCol: 2,
      cols: 2,
      rows: 4
    },
    emailsBodyRange: {
      startRow: 14,
      startCol: 1,
      cols: 3
    }
  }

  function getAllInputs() {
    var introsMSM = montagSM(SSID, INTROS_SHEETNAME);
    introsMSM.getOnTopRange(INPUT_RANGES.introsRangeParam);
    introsMSM.getOnTopRange(INPUT_RANGES.visionsRangeParam);
    introsMSM.getVerticalRange(INPUT_RANGES.otherInfoRangeParam);
    var platformDataMSM = montagSM(SSID, PLATFORMDATA_SHEETNAME);
    platformDataMSM.getVerticalRange(INPUT_RANGES.facebookInfoRange);
    platformDataMSM.getVerticalRange(INPUT_RANGES.instagramInfoRange);
    var exportMSM = montagSM(SSID, EXPORT_SHEETNAME);
    exportMSM.getVerticalRange(INPUT_RANGES.emailInfoRange);
    exportMSM.getListRange(INPUT_RANGES.emailsListRange);
    exportMSM.getOnTopRange(INPUT_RANGES.emailsBodyRange);
    var inputsObj = Object.assign({},introsMSM.aggregateObj,platformDataMSM.aggregateObj,exportMSM.aggregateObj);
    return inputsObj;
  }

  SHEETS_MANAGER.getAllInputs = getAllInputs;
  return SHEETS_MANAGER
})
*/