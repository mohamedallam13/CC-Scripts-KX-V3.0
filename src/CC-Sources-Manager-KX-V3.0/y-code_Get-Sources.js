
; (function (root, factory) {
  root.SHEET_PROPERTIES = factory()
})(this, function () {

  const SHEET_PROPERTIES = {};

  const REFERENCES_MANAGER = CCLIBRARIES.REFERENCES_MANAGER;

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

  const REQUIRED_REFERENCES = ["divisionsProperties"];

  var referencesObj;

  function getSources () {
    getReferences();
    var SHEETS_ARRAY = createSheetsArray();
    return SHEETS_ARRAY;
  }

  function getReferences() {
    referencesObj = REFERENCES_MANAGER.defaultReferences.requireFiles(REQUIRED_REFERENCES).requiredFiles;
  }

  function createSheetsArray() {
    var SHEETS_ARRAY = [];
    var divisionsPropertiesObj = referencesObj.divisionsProperties;
    var divisionProperties = divisionsPropertiesObj.fileContent;
    var allDivisions = Object.keys(divisionProperties);
    allDivisions.forEach(divisionLabel => {
      var divisionObj = divisionProperties[divisionLabel];
      var activities = Object.keys(divisionObj);
      SHEETS_ARRAY = SHEETS_ARRAY.concat(activities);
    })
    return SHEETS_ARRAY
  }

  SHEET_PROPERTIES.SHEETS_ARRAY = getSources ();
  SHEET_PROPERTIES.SSID = SSID
  SHEET_PROPERTIES.SHEET_OPTIONS_ARRAY = SHEET_OPTIONS_ARRAY

  return SHEET_PROPERTIES;

})


