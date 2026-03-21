; (function (root, factory) {
  root.CLEAN_SUBMISSION = factory()
})(this, function () {

  const CLEAN_SUBMISSION = {}

  const EMAIL_SIMILARITY_LOWER_LIMIT = 0.85;
  const DEFAULT_EMAIL = "n@n.com";

  var sourceDBObj
  var aggregateDBObj = {};
  var isAnonymous = false;

  const cleanSubmissionObj = {
    baseA: {},
    baseB: {},
    mapped: {},
    unmapped: {},
    timestamp: "",
    email: "",
    serial: "",
    id: "",
    userId: "",
    fillCheck: "",
    userScore: 0
  }

  function initiateGlobals(sourceDB, aggregatedDB, isAnon) {
    sourceDBObj = sourceDB;
    Object.keys(aggregatedDB).forEach(dbName => {
      aggregateDBObj[dbName] = aggregatedDB[dbName]
    })
    isAnonymous = isAnon;
  }

  function createCleanSubmissionObj(entry, map) {
    if (!entry) {
      return cleanSubmissionObj;
    }
    convertEntryParamtersIntoBaseParamters(entry, map);
    addTimestamp();
    getIds();
    getSubmissionId();
    getFillCheck();
    refitDataInSubmissionObject();
    return cleanSubmissionObj;
  }

  function getIds() {
    getUserId();
    getSubmissionId();
    if (isAnonymous) {
      getSerial();
    }
  }

  function getUserId() {
    cleanSubmissionObj.userId = getIdFromDB(aggregateDBObj.CCOne.index);
  }

  function getSubmissionId() {
    cleanSubmissionObj.id = getIdFromDB(sourceDBObj.index);
  }

  function getSerial() {
    cleanSubmissionObj.serial = CONFESSIONS.getSerial(cleanSubmissionObj);
  }

  /////////////////////////////Conversion From Map;

  function convertEntryParamtersIntoBaseParamters(entry, map) {
    Object.keys(map).forEach(bHeader => {
      var oHeader = getOriginalHeader(map, bHeader);
      if (!oHeader) {
        return;
      }
      populateSubmissionObjectSections(entry, bHeader, oHeader);
    })
  }

  function getOriginalHeader() {
    var originalHeader = map[bHeader];
    if (originalHeader == "") {
      return;
    }
    originalHeader = originalHeader.toString().trim();
    return originalHeader;
  }

  function populateSubmissionObjectSections(entry, bHeader, oHeader) {
    if (!entry[oHeader]) {
      cleanSubmissionObj.unmapped[oHeader] = entry[oHeader]
      return;
    }
    var baseCheckA = bHeader.indexOf("_a") != -1;
    var baseCheckB = bHeader.indexOf("_b") != -1;
    if (baseCheckA) {
      bHeader = bHeader.replace("_a", "");
      addTrimmedSubmissionParamter(cleanSubmissionObj.baseA, entry, bHeader, oHeader);
    } else if (baseCheckB) {
      bHeader = bHeader.replace("_b", "");
      addTrimmedSubmissionParamter(cleanSubmissionObj.baseB, entry, bHeader, oHeader);
    } else {
      addTrimmedSubmissionParamter(cleanSubmissionObj.mapped, entry, bHeader, oHeader);
    }
  }

  function addTrimmedSubmissionParamter(obj, entry, bHeader, oHeader) {
    bHeader = cleanIllegalsInHead(bHeader);
    obj[bHeader] = entry[oHeader];
    if (Object.prototype.toString.call(entry[originalHeader]) !== '[object Date]') {
      obj[bHeader] = obj[bHeader].toString().trim();
    }
  }

  function cleanIllegalsInHead(bHeader) {
    var globalRegex = new RegExp(/[^\w\s]/g);
    if (globalRegex.test(key)) {
      bHeader = bHeader.replace(globalRegex, '_');
    }
    return bHeader;
  }

  /////////////////////////////Augmentations;


  function addTimestamp() {
    cleanSubmissionObj.timestamp = cleanSubmissionObj["Timestamp"];
  }

  function getIdFromDB(index) {
    var email = submissionObj.email;
    for (let indexEmail in index) {
      var similarity = Toolkit.similarity(indexEmail, email);
      if (similarity <= 1 && similarity > EMAIL_SIMILARITY_LOWER_LIMIT) {
        return index[indexEmail];
      }
    }
    return "";
  }

  function getFillCheck() {
    if (cleanSubmissionObj["First Name"] == "" || cleanSubmissionObj["Gender"] == "") {
      cleanSubmissionObj.fillCheck = false;
      return;
    }
    cleanSubmissionObj.fillCheck = true;
  }

  /////////////////////////////Refits;

  function refitDataInSubmissionObject() {
    //    refitTimestamp(obj);
    refitEmail();
    //replaceDashValues(obj);
    refitName();
    refitDateOfBirth();
    refitAddress();
    refitMajor();
    refitMobile();
  }

  function refitTimestamp(obj) {
    obj['Timestamp'] = Toolkit.refitTimestamp(obj['Timestamp'])
  }

  function replaceDashValues(obj) {
    var keys = Object.keys(obj);
    keys.forEach(function (key) {
      if (key.indexOf('-') != -1) {
        var originalKey = key.slice(1);
        if (!obj[originalKey]) {
          obj[originalKey] = obj[key]
        }
        delete obj[key]
      }
    })
  }

  /////////////////////////////Refiting Name;

  function refitName() {
    var baseObj = cleanSubmissionObj.baseB;
    if (baseObj['First Name'] && baseObj['Last Name']) {
      cleanSubmissionObj.userScore = baseObj['First Name'][0] == baseObj['First Name'][0].toUpperCase() ? cleanSubmissionObj.userScore + 0 : cleanSubmissionObj.userScore - 1;
      baseObj['First Name'] = Toolkit.toTitleCase(baseObj['First Name']);
      baseObj['Last Name'] = Toolkit.toTitleCase(baseObj['Last Name']);
    }
  }

  function refitDateOfBirth() {
    var baseObj = cleanSubmissionObj.baseB;
    if (!baseObj['Date of birth']) {
      if (!baseObj['Age']) {
        baseObj['Age'] = baseObj['Other (Age)']
        delete baseObj['Other (Age)']
      }
      if (baseObj['Age']) {
        baseObj['Age'] = baseObj['Age'] == '' ? '' : parseInt(baseObj['Age'].toString().match(/\d+/)[0]);
        baseObj['Date of birth'] = new Date(new Date(baseObj['Timestamp']).setYear(obj['Timestamp'].getYear() - baseObj['Age']));
        baseObj['DoBType'] = "V";
      }
    } else {
      if (baseObj['Age']) {
        baseObj['Age'] = parseInt(baseObj['Age'].toString().match(/\d+/)[0]);
        var now = new Date();
        if (now.getYear() - baseObj['Timestamp'].getYear() < 10) {
          baseObj['Date of birth'] = new Date(new Date(obj['Date of birth']).setYear(now.getYear() - baseObj['Age']))
          baseObj['DoBType'] = "A";
        }
      }
    }
  }

  /////////////////////////////Refiting Address;

  function refitAddress() {
    var baseObj = cleanSubmissionObj.baseB;
    if (baseObj.CityGov) {
      baseObj.CityGov = baseObj.CityGov.toUpperCase();
    }
    if (!baseObj['District'] || baseObj['District'] == '') {
      baseObj['District'] = baseObj['Other (District)'];
    }
    if (!baseObj['Address/District'] || baseObj['Address/District'] == '') {
      var pre = baseObj['Address'] ? baseObj['Address'] : "";
      baseObj.Address_District = pre + ", " + baseObj['District'];
    } else {
      baseObj.Address_District = baseObj['Address/District'];
    }
    delete baseObj['District'];
    delete baseObj['Address'];
    delete baseObj['Other (District)'];
    delete baseObj['Address/District'];
  }

  /////////////////////////////Refiting Major;

  function refitMajor(obj) {
    var baseObj = cleanSubmissionObj.baseB;
    if (!baseObj['Major (if University)']) {
      if (!baseObj['Other (Major)']) {
        if (baseObj['Education'] == 'Highschool') {
          baseObj.Major = 'Highschool';
        } else {
          baseObj.Major = 'Unspecified'
        }
      }
    } else {
      baseObj.Major = baseObj['Major (if University)'];
      delete baseObj['Other (Major)']
      delete baseObj['Major (if University)']
    }
  }

  /////////////////////////////Refiting Emails;

  function refitEmail() {
    var baseObj = cleanSubmissionObj.baseB;
    var emailA = baseObj["Email"];
    var emailB = baseObj["-Email"];
    if (!emailA && !emailB) {
      getAnonEmail(cleanSubmissionObj);
    } else if (!emailA || typeof emailA === "undefined" || emailA == "") {
      delete baseObj["-Email"];
      cleanSubmissionObj.email = emailB.toString().toLowerCase();
    } else {
      delete baseObj["Email"];
      cleanSubmissionObj.email = emailA.toString().toLowerCase();
    }
    checkIfDefaultEmail(cleanSubmissionObj);
  }
  function getAnonEmail() {
    //Match on Serial in case it exists there;
    var lastEmailFromEmailsBySerial = aggregateDBObj.CCConfessionsEmails[cleanSubmissionObj.id];
    if (lastEmailFromEmailsBySerial) {
      cleanSubmissionObj.email = lastEmailFromEmailsBySerial
    } else {
      cleanSubmissionObj.email = "NO_EMAIL_" + Toolkit.dateValueString(obj.Timestamp); //TODO: Check Tools
    }
  }

  function checkIfDefaultEmail() {
    var email = cleanSubmissionObj.email;
    if (!email) {
      return;
    }
    var similarity = Toolkit.similarity(DEFAULT_EMAIL, email);
    if (similarity <= 1 && similarity > EMAIL_SIMILARITY_LOWER_LIMIT) {
      delete cleanSubmissionObj.email;
    }
  }

  /////////////////////////////Refiting Mobile Phone;

  function refitMobile(obj) {
    obj.Mobile = Toolkit.refitProperMobileNumber(obj.Mobile);
  }

  // function cleanIllegal(obj) {
  //   for (var key in obj) {
  //     var globalRegex = new RegExp(/[^\w\s]/g);
  //     if (globalRegex.test(key)) {
  //       var newKey = key.replace(globalRegex, '_');
  //       obj[newKey] = obj[key];
  //       delete obj[key];
  //     }
  //   }
  // }

  CLEAN_SUBMISSION.initiateGlobals = initiateGlobals;
  CLEAN_SUBMISSION.createCleanSubmissionObj = createCleanSubmissionObj;

  return CLEAN_SUBMISSION;
})