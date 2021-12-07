// const DEPENDECIES= { 
//  CCLIBRARIES: "1M-HVmwVCGEcG5fEOfYPWkNat4p8LZidFiC6vsUBtGTt74gc19ASNmJRh", 
//  }

; (function (root, factory) {
  root.CAMPAIGNS_AUTOMATIC_HANDLER = factory()
})(this, function () {

  const CAMPAIGNS_AUTOMATIC_HANDLER = {};

  const REFERENCES_MANAGER = CCLIBRARIES.REFERENCES_MANAGER;
  const FORMULATOR = CCLIBRARIES.FORMULATOR;

  const Toolkit = CCLIBRARIES.Toolkit;

  const REQUIRED_REFERENCES = ["divisionsProperties", "subDivisionPropertes", "JSONDBsIndex", "deployedScripts"];
  var referencesObj;
  var CCSOURCESMGR;

  var paramObj;

  var response = {
    data: {}
  };
  var date;

  //////////////////////////////////////// MAIN

  function handleRequest(param) {
    getDate();
    var error = checkMinValidity(param);
    if (error) {
      reponse.error = error;
      return response;
    }
    getReferences();
    paramObj = new ParamObj(param);
    try {
      processRequest(paramObj);

    } catch (e) {
      console.log(e);
      response.error = e;
      return response;
    }
    return response;
  }

  function getDate() {
    date = new Date();
  }

  /////////////////////////////////////////// MAIN HELPERS

  function checkMinValidity(param) {
    if (!param.activity || !param.division || !param.season || !param.request) {
      response.error = "Please verify your request! Missing parameters: division, season, activity or request!";
    }
    if (!CampaignsAutoHandler[param.request]) {
      response.error = "Please verify your request!, " + param.request + " is not a valid request!"
    }
  }

  function getReferences() {
    getRequiredIndexes();
    getRequiredScripts();
  }

  function getRequiredIndexes() {
    referencesObj = REFERENCES_MANAGER.defaultReferences.requireFiles(REQUIRED_REFERENCES).requiredFiles;
  }

  function getRequiredScripts() {
    const ccSourcesInfoObj = referencesObj.deployedScripts.fileContent.CCSOURCESMGR;
    CCSOURCESMGR = CCLIBRARIES.modulesRequire(ccSourcesInfoObj);
    // CCSOURCESMGR = modulesRequire(ccSourcesInfoObj);
  }

  function ParamObj(param) {
    Object.assign(this, param);
    var activityObj = referencesObj.divisionsProperties.fileContent[this.division][this.activity];
    this.activityObj = activityObj;
    this.seasonObj = activityObj.seasons[this.season] || activityObj;
    this.formsInstances = getAllFormsInstancesForIncluded(this.seasonObj);
  }

  function getAllFormsInstancesForIncluded(seasonObj) {
    var formsInstances = {};
    var formGroupLabels = ["forms", "lastRoundForms"];
    formGroupLabels.forEach(formGroupLabel => {
      var formGroup = seasonObj[formGroupLabel];
      var formLabels = Object.keys(formGroup);
      formsInstances[formGroupLabel] = {};
      formLabels.forEach(formLabel => {
        var formId = formGroup[formLabel].id;
        formsInstances[formGroupLabel][formLabel] = FORMULATOR.createFormsInstance(formId).setResponsesSheetData();
      })
    })
    return formsInstances;
  }

  //////////////////////////////////////////////// METHODS MAIN

  function processRequest(paramObj) {
    CampaignsAutoHandler[paramObj.request]();
  }

  const CampaignsAutoHandler = {
    "newEvent": function () {
      var acceptingResponses = checkIfLastRoundIsClosed();
      if (acceptingResponses) {
        response.error = "Please close last Round's application first!"
        return;
      }
      getRoundNumber();
      createRoundFolder();
      processForms();
      updateSystem(); // TODO
      // writePropertiesFile();
      response.success = true;
    },
    "updateEvent": function () {

    },
    "closeLastApplication": function () {
      paramsObj.formsInstances.lastRoundForms.application.isAccepting(false);
      response.success = true;
    },
    "populateSignUp": function () {
      var acceptingResponses = checkIfLastRoundIsClosed();
      if (acceptingResponses) {
        response.error = "Please close last Round's application first!"
        return;
      }
      var lastSignupSheetFormId = divisionsPropertiesObj[type][activity].seasons[season].lastRoundForms["signup"];
      var attendees = getAttendees();
      updateListInForm(lastSignupSheetFormId, attendees, "Email");
    }
  }

  ////////////////////////////////////////////////// METHODS HELPERS

  function checkIfLastRoundIsClosed() {
    var lastRoundApplicationInstance = paramObj.formsInstances.lastRoundForms.application;
    return lastRoundApplicationInstance.isAccepting();
  }

  function getRoundNumber() {
    paramObj.seasonObj.counter += 1; //seasonObj is only a pointer to the original divisionsProperties file
    response.data.nextRoundNumber = paramObj.seasonObj.counter;
    paramObj.nextRoundNumber = paramObj.seasonObj.counter;
    // return paramObj.seasonObj.counter;
  }

  function createRoundFolder() {
    var seasonFolder = DriveApp.getFolderById(paramObj.seasonObj.directory);
    var newRoundFolder = DriveApp.createFolder("Round " + paramObj.nextRoundNumber);
    newRoundFolder.moveTo(seasonFolder);
    paramObj.newRoundFolder = newRoundFolder;
    // return newRoundFolder;
  }


  function processForms() {
    var group = "lastRoundForms"
    var toCreateFromForms = paramObj.formsInstances[group];
    var formsProperties = paramObj.seasonObj[group];
    Object.keys(toCreateFromForms).forEach(formLabel => {
      var formInstance = toCreateFromForms[formLabel];
      var formProperties = formsProperties[formLabel];
      var newName = rename(formInstance.fileName(), paramObj.nextRoundNumber);
      var newTitle = rename(formInstance.title(), paramObj.nextRoundNumber);
      var newFormInstance = formInstance.copyForm(paramObj.newRoundFolder, newName, newTitle);
      adjustFormElements(formLabel, newFormInstance, formProperties);
      addFormURLsToResponse(newFormInstance, formLabel);
      addEditors(newFormInstance);
    })
  }

  function adjustFormElements(formLabel, newFormInstance, formProperties) {
    var elementsObj = formProperties.templates;
    var elements = Object.keys(elementsObj);
    elements.forEach(element => {
      var elementVariable = formLabel + "_" + element;
      var passedTemplate = paramObj[elementVariable];
      if (!passedTemplate) {
        return
      }
      var populatedTemplate = Toolkit.createTemplateSimple(passedTemplate, paramObj);
      if (!newFormInstance[element]) {
        return
      }
      newFormInstance[element](populatedTemplate);
      elementsObj.template = populatedTemplate; //elementsObj is only a pointer to the original divisionsProperties file
    })
  }

  function rename(oldFileName, nextRoundNumber) {
    var currentYear = date.getFullYear()
    oldFileName = replaceMonthName(oldFileName);
    var newFileName = oldFileName.replace("Copy of ", "").replace(/S([0-9]{1})/g, paramObj.season).replace(/R([0-9]{1})/g, "R" + nextRoundNumber).replace(/\(\b(19|20)\d{2}\b\)/g, currentYear);
    return newFileName;
  }

  function replaceMonthName(fileName) {
    const MONTHS = ["Januray", "Febraury", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const MONTHS_REGEX = /(\b\d{1,2}\D{0,3})?\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|(Nov|Dec)(?:ember)?)/

    var currentMonthIndex = date.getMonth();
    var monthName = MONTHS[currentMonthIndex];
    var monthNameArray = fileName.match(MONTHS_REGEX);
    if (monthNameArray) {
      var monthNameInFile = monthNameArray[0]
    } else {
      return fileName;
    }
    if (monthName == monthNameInFile) {
      var underScorePoition = fileName.indexOf("_")
      if (underScorePoition == -1) {
        monthName = monthName + "_2";
        fileName = fileName.replace(monthName, monthName + "_2")
      } else {
        var number = fileName[underScorePoition + 1];
        fileName = fileName.replace(monthName + "_" + number, monthName + "_" + (parseint(number) + 1))
      }
    } else {
      fileName = fileName.replace(monthNameInFile, monthName);
    }
    return fileName;
  }

  function addFormURLsToResponse(newFormInstance, formLabel) {
    response.data[formLabel + "_shortenedpublishedURL"] = newFormInstance.shortenedpublishedURL;
    response.data[formLabel + "editURL"] = newFormInstance.editURL;
  }

  function addEditors(newFormInstance) {
    if (paramObj.user) {
      console.log(paramObj.user);
      newFormInstance.formEditors(paramObj.user).resultsEditors(paramObj.user);
    }
  }

  function updateSystem() {
    const requestObj = new SourcesRequestObj();
    const sourcesUpdateSuccess = CCSOURCESMGR.post(requestObj);
    console.log(sourcesUpdateSuccess.sourceError);
    response.data.sourcesUpdateSuccess = sourcesUpdateSuccess;
    console.log(sourcesUpdateSuccess);
  }

  function SourcesRequestObj() {
    const allParamsObj = Object.assign({}, paramObj, paramObj.activityObj, paramObj.seasonObj)
    this.process = "runAutoAddSource";
    this.formResponsesOptions = {
      URL: allParamsObj.formsInstances.forms.application.responsesSheetURL,
      ssid: allParamsObj.formsInstances.forms.application.responsesSheetId
    }
    this.primaryClassifierName = allParamsObj.name;
    this.primaryClassifierCode = allParamsObj.activity;
    this.secondaryClassifierName = allParamsObj.roundName || Toolkit.createTemplateSimple(allParamsObj.namingFormat, allParamsObj);
    this.secondaryClassifierCode = allParamsObj.roundCode;
    this.branch = allParamsObj.division;
    this.sourceType = allParamsObj.sourceType;
    this.autoActions = {
      include: true,
      accepting: true,
      autoActivate: true
    }
  }

  function writePropertiesFile() {
    referencesObj.divisionsProperties.update();
  }

  CAMPAIGNS_AUTOMATIC_HANDLER.handleRequest = handleRequest;

  return CAMPAIGNS_AUTOMATIC_HANDLER;

})

function createNextGatheringsRound() {
  var requestObj = {
    request: "newEvent",
    division: "Events",
    activity: "CCG",
    season: "S9",
    roundName: "",
    roundCode: "SIXR5",
    sourceType: "GSheet",
    user: "galaxym88@gmail.com",
    // application_description: "welcome, < user >!",
    setDate: "2021-08-20T22:00:00.000Z",
    facebookGroupLink: "https://www.facebook.com/groups/ccgatheringsixr5",
    whatsappGroupLink: "https://chat.whatsapp.com/LxDaC10uSKTLMajYvOZjDM",
    talkingTopic: "Men's Mental Health"
  }
  var response = CAMPAIGNS_AUTOMATIC_HANDLER.handleRequest(requestObj);
  console.log(response);
}