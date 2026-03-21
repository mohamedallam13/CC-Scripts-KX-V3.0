; (function (root, factory) {
  root.STRUCTURING_MAIN = factory()
})(this, function () {

  var STRUCTURING_MAIN = {};

  const STRUCTURE_CHANGES_MAP = {
    cleanSubmissionObj: {},
    sourceEntry: {},
    userEntry: {}
  }

  var scriptProperties;
  var sourceDBObj;
  var aggregateDBObj = {};
  var rawSourceData;
  var isAnonymous = false;
  var latestEntries;
  var sheetObj;
  var confessionsColumn = [];

  const sourceEntryObj = {
    submissionsArr: [],
    status: "Pending",
    statusHistory: [],
    id: "",
    emailArr: []
  }

  const statusHistoryObj = {
    status: "",
    timestamp: ""
  }


  function structureDB(sourceDB, aggregatedDB, latestEntriesObject, rawSource) {
    initiateGlobals(sourceDB, aggregatedDB, latestEntriesObject, rawSource);
    if (isAnonymous) {
      getConfessionsColumn();
      CONFESSIONS.inititate(confessionsColumn, rawSourceData);
    }
    //getStructureVersion();
    processLatestEntries();
    saveCurrentStructures();
  }

  function processLatestEntries() {
    latestEntries.forEach(entry => {
      var cleanSubmissionObj = CLEAN_SUBMISSION.createCleanSubmissionObj(entry, rawSource.map);
      processUserEntry(cleanSubmissionObj);
      processSourceEntry(cleanSubmissionObj);
    })
  }

  function initiateGlobals(sourceDB, aggregatedDB, latestEntriesObject, rawSource) {
    initiateMainGlobal(sourceDB, aggregatedDB, latestEntriesObject, rawSource);
    CLEAN_SUBMISSION.initiateGlobals(isAnonymous, sourceDBObj, aggregateDBObj);
    STRUCTURING_CCONE.initiateCCOne(aggregatedDB, rawSource);
  }

  function initiateMainGlobal() {
    initiateProperties();
    sourceDBObj = sourceDB;
    latestEntries = latestEntriesObject.latestEntries;
    sheetObj = latestEntriesObject.sheetObj;
    Object.keys(aggregatedDB).forEach(dbName => {
      aggregateDBObj[dbName] = aggregatedDB[dbName]
    })
    isAnonymous = rawSource.branch == "Confessions" ? true : false;
    rawSourceData = rawSource;
  }

  function initiateProperties() {
    scriptProperties = PropertiesService.getScriptProperties();
  }

  function getStructureVersion() {
    var allKeysObj = {
      cleanSubmissionKeys: Object.keys(CLEAN_SUBMISSION.createCleanSubmissionObj()),
      sourceEntrykeys: Object.keys(sourceEntryObj),
      UserEntryKeys: Object.keys(STRUCTURING_CCONE.userEntryObj)
    }
    var overAllCheckSameKeys = CompareStructures(allKeysObj);
    if (overAllCheckSameKeys) {
      return;
    } else {
      version++;
    }
  }

  function CompareStructures(allKeysObj) {
    var overAllCheckSameKeys = true;
    Object.keys(allKeysObj).forEach(keysLabel => {
      var keys = allKeysObj[keysLabel]
      var lastKeys = getLastKeysFromScriptProp(keysLabel);
      var checkSameKeys = Toolkit.arrayEquals(keys, lastKeys);
      overAllCheck = overAllCheck && checkSameKeys;
    })
    return overAllCheckSameKeys;
  }

  function getLastKeysFromScriptProp() {

  }

  function saveCurrentStructures() {

  }

  function getConfessionsColumn() {
    var confessionsColHeader = rawSourceData.map["Confession"];
    sheetObj.columnToArray(confessionsColHeader);
    confessionsColumn = sheetObj.column[confessionsColHeader];
  }

  /////////////////////////////Decide on Entry

  function processSourceEntry(cleanSubmissionObj) {
    if (isAnonymous) {
      sanitizeContacts(cleanSubmissionObj);
    }
    if (cleanSubmissionObj.id != "") {
      updateSourceEntryInDB(cleanSubmissionObj);
    } else {
      addNewSourceEntryInDB(cleanSubmissionObj);
    }
  }

  function processUserEntry(cleanSubmissionObj) {
    if (cleanSubmissionObj.userId != "") {
      cleanSubmissionObj.userId = userId;
      handleExistingUserSubmission(cleanSubmissionObj);
    } else {
      handleNewUserSubmission(cleanSubmissionObj);
    }
  }
  function handleExistingUserSubmission(cleanSubmissionObj) {
    var userDBEntry = aggregateDBObj.CCOne.data[cleanSubmissionObj.userId];
    var isConfessor = userDBEntry.roles.indexOf("Applicant") == -1;
    var fillCheck = cleanSubmissionObj.fillCheck;
    if (!isAnonymous && isConfessor && !fillCheck) {
      //Applications mode and existing user is a confessor profile and did not fill out the form
      warnUser(cleanSubmissionObj);
    } else {
      updateUserData(cleanSubmissionObj);
    }
  }

  function handleNewUserSubmission(cleanSubmissionObj) {
    var fillCheck = cleanSubmissionObj.fillCheck;
    if (!isAnonymous && !fillCheck) {
      //Applications mode and new user did not fill out the form
      warnUser(cleanSubmissionObj);
    } else {
      addNewUserToDB(cleanSubmissionObj);
    }
  }

  function addNewSourceEntryInDB(cleanSubmissionObj) {
    if(isAnonymous){
      createSourceId(cleanSubmissionObj, cleanSubmissionObj.serial);
    }else{
      createSourceId(cleanSubmissionObj);
    }
    var sourceEntryObj = new SourceEntryObj(cleanSubmissionObj);
    createEntryInSourcesDB(sourceEntryObj);
  }

  function createSourceId(cleanSubmissionObj, number) {
    var applicationPrefix = rawSourceData.primaryClassifierCode + "_" + rawSourceData.secondaryClassifierCode.replace(/\s/g, '');
    number = number || Toolkit.dateValueString(cleanSubmissionObj.timestamp);
    cleanSubmissionObj.id = createId(applicationPrefix, number);
  }

  function SourceEntryObj(cleanSubmissionObj) {
    var combinedObj = new CombinedEntry(cleanSubmissionObj);
    Object.assign(this, sourceEntryObj)
    this.id = cleanSubmissionObj.id;
    this.submissionsArr = [combinedObj];
    this.emailArr = [cleanSubmissionObj.email];
  }

  function CombinedEntry(cleanSubmissionObj) {
    var combinedObj = {
      baseA: Object.assign({}, cleanSubmissionObj.baseA),
      baseB: Object.assign({}, cleanSubmissionObj.baseB),
      mapped: Object.assign({}, cleanSubmissionObj.mapped),
      unmapped: Object.assign({}, cleanSubmissionObj.unmapped)
    }
    return combinedObj;
  }

  function createEntryInSourcesDB(sourceEntryObj) {
    var email = sourceEntryObj.emailsArr[0];
    sourceDBObj.index[email] = sourceEntryObj.id;
    sourceDBObj.data[applicationId] = sourceEntryObj;
  }

  function updateSourceEntryInDB(cleanSubmissionObj) {
    var sourceEntryId = cleanSubmissionObj.id;
    var sourceEntryObj = sourceDBObj.data[sourceEntryId];
    sourceEntryObj.submissionsArr.unshift(applicationObj);
  }

  function addNewUserToDB(cleanSubmissionObj) {
    createUserId(cleanSubmissionObj);
    STRUCTURING_CCONE.addUserToDB(cleanSubmissionObj);
  }

  function createUserId(cleanSubmissionObj){
    var number = Toolkit.dateValueString(cleanSubmissionObj.timestamp);
    cleanSubmissionObj.userId = createId("CCER", number);
  }

  function updateUserData(cleanSubmissionObj) {
    STRUCTURING_CCONE.updateUserInDB(cleanSubmissionObj, isAnonymous);
  }

  function warnUser() {
    console.log("Warning");
  }

  function createId(prefix, number) {
    return prefix + '_' + number;
  }

  function sanitizeContacts(cleanSubmissionObj) {
    var email = cleanSubmissionObj.email;
    aggregateDBObj.emailsBySerial.index[cleanSubmissionObj.id] = email;
    delete cleanSubmissionObj.email;
  }

  STRUCTURING_MAIN.structureDB = structureDB;
  return STRUCTURING_MAIN;
})