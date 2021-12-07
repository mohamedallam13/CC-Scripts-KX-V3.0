function doPost(e) {
  return CCLIBRARIES.MODULESEXPORT.postRequest(e, this)
}

function doGet(e) {
  return CCLIBRARIES.MODULESEXPORT.getRequest(e, this)
}

/////////////////////////////////////////////////////////////////

//API

function runAutoAddSource(param) {
  if (!param) {
    console.log("No params provided");
    return { error: "No params provided", param: param };
  }
  SOURCE_INFO_MANAGER.addNewSource(param);
  SOURCES_MANAGER_OPTIONS.setMapsPerActivity(param.primaryClassifierCode);
  SOURCE_FILE_CONSTRUCTOR.createSourcesFile();
  return { sourcesUpdateSuccess: true }
}

function testAutoRun() {
  const param = {
    formResponsesOptions: {
      URL: "https://docs.google.com/spreadsheets/d/1zw7fnNh1zHWPXyn4BIB5jFCWh8sv-mtbUwebZOFCq_o/edit?usp=drive_web&ouid=101626450118027500527",
      ssid: "1zw7fnNh1zHWPXyn4BIB5jFCWh8sv-mtbUwebZOFCq_o"
    },
    primaryClassifierName: "CC Gatherings",
    primaryClassifierCode: "CCG",
    secondaryClassifierName: "Season VIII Round 1",
    secondaryClassifierCode: "SVIIIR1",
    branch: "Events",
    sourceType: "GSheet",
    autoActions: {
      include: true,
      accepting: true,
      autoActivate: true
    }
  }
  runAutoAddSource(param)
}

///////////////////////////////////////////////////////

//Local onOpen

function completeSourcesForActivity() {
  const activity = SpreadsheetApp.getActive().getSheetName();
  SOURCE_INFO_MANAGER.addAllSourcesPerActivity(activity);
  SOURCES_MANAGER_OPTIONS.setMapsPerActivity(activity);
  SOURCE_FILE_CONSTRUCTOR.createSourcesFile();
}

function completeAllSources() {
  SOURCE_INFO_MANAGER.addNewSourcesInAllSheets();
  SOURCES_MANAGER_OPTIONS.setMapsForAll();
  SOURCE_FILE_CONSTRUCTOR.createSourcesFile();
}

function activateSources() {
  const activity = SpreadsheetApp.getActive().getSheetName();
  SOURCES_MANAGER_OPTIONS.setMapsPerActivity(activity);
}

function resetSources() {
  SOURCE_FILE_CONSTRUCTOR.createSourcesFile(true);
}