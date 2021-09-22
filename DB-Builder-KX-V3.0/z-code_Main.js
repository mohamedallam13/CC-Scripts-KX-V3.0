; (function (root, factory) {
  root.CC_DB_BUILDER_KX = factory()
})(this, function () {

  var CC_DB_BUILDER_KX = {};

  const MASTER_REFERENCE_FILE_ID = "18v8jqGGsu3PYmLWkFH0tFVSqhQzMJfsn";
  var allFileIds;

  function init(command, param) {
    getMasterIndex();
    TRIGGERS_MANAGER.setContinutaionTrigger(command);
    KXDBHANDLER.initializeHandler(allFileIds);
    DB_BUILDER[command](param);
    TRIGGERS_MANAGER.deleteContinuationTrigger(command);
  }

  const DB_BUILDER = {
    build: function (param) {
      if (!param.submissionLoad) {
        getLatestFromAllSources(param);
      } else {
        injectIntoDB(param);
      }
    },
    update: function () {

    },
    reset: function () {
      function clearDBs() {
        console.log("Start.. ");
        clearCounters();
        DBHANDLER.clearDBs(ALL_FILE_IDS, BRANCHES);
        console.log("DB Cleared");
      }
      function clearCounters() {
        getAllSources();
        BRANCHES.forEach(function (branch) {
          DIVISIONS.forEach(function (division) {
            if (allSources[branch]) {
              if (allSources[branch][division]) {
                allSources[branch][division].forEach(function (row) {
                  console.log("Clearing Counter: " + row.secondaryClassifierCode);
                  row.counter = 0;
                })
              }
            }
          })
        })
        Toolkit.writeToJSON(allSources, ALL_FILE_IDS.sourcesIndexedFileId);
      }
    },
    destroy: function () {

    }
  }

  function getMasterIndex() {
    allFileIds = Toolkit.readFromJSON(MASTER_REFERENCE_FILE_ID);
  }


  function injectIntoDB(param) {
    var aggregatedDBObj = KXDBHANDLER.initializeAggregatingDB();

  }
  function getLatestFromAllSources(param) {
    var aggregatedDBObj = KXDBHANDLER.initializeAggregatingDB();
    var rawSourcesArr = getRawSources(param);
    rawSourcesArr.forEach(rawSourceData => {
      var latestEntriesObj = CCEXTRACTDATA.init(rawSourceData);
      if (!latestEntriesObj.latestEntries) {
        return;
      }
      processSourcePendingRawData(sourceDBObj, aggregatedDBObj, latestEntriesObj, rawSourceData);
      saveCounters(rawSourceData);
    });
  }

  function processSourcePendingRawData(sourceDBObj, aggregatedDBObj, latestEntriesObj, rawSourceData) {
    var sourceDBObj = KXDBHANDLER.initializeSourceDB(rawSourceData);
    DBSTRUCTURE.createDBStructure(sourceDBObj, aggregatedDBObj, latestEntriesObj, rawSourceData);
    KXDBHANDLER.updateSourceDBFile();
    KXDBHANDLER.updateAggregatingDB();
  }

  function getRawSources(param) {
    var branchesArr = param.branches;
    var divisionsArr = param.divisions;
    var sourcesArr = [];
    getAllSources();
    branchesArr.forEach(function (branch) {
      divisionsArr.forEach(function (division) {
        if (allSources[branch]) {
          if (allSources[branch][division]) {
            sourcesArr = sourcesObjArr.concat(allSources[branch][division]);
          }
        } else if (allSources[division]) {
          sourcesArr = sourcesObjArr.concat(allSources[division]);
        }
      })
    })
    return sourcesArr;
  }

  CC_DB_BUILDER_KX.init = init;

  return CC_DB_BUILDER_KX
})

function build() {
  var param = {
    branches: [],
    divisions: [],
    aggregatedDBs: [],
    submissionLoad: {}
  }
  CC_DB_BUILDER_KX.init("build", param)
}

function update() {
  CC_DB_BUILDER_KX.init("update")
}

function reset() {
  CC_DB_BUILDER_KX.init("reset")
}

function destroy() {
  CC_DB_BUILDER_KX.init("destroy")
}
