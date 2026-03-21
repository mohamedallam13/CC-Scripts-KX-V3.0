; (function (root, factory) {
  root.STRUCTURING_CCONE = factory()
})(this, function () {

  var STRUCTURING_CCONE = {};

  var aggregateDBObj = {};
  var rawSourceData;

  const userEntryObj = {
    submissionsAArr: [],
    submissionsBArr: [],
    id: "",
    userScore: 0,
    latestRole: "",
    roles: [],
    roleHistory: [],
    susConfessions: [],
    banned: false,
    statusHistory: [],
    activityHistory: [],
    emailsArr: [],
    latestFullDataUpdate: "",
    latestContactsUpdate: ""
  }

  const statusHistoryObj = {
    status: "",
    timestamp: ""
  }

  const roleHistoryObj = {
    role: "",
    timestamp: ""
  }

  const activityHistoryObj = {
    role: "",
    timestamp: ""
  }

  function initiateCCOne(aggregatedDB, rawSource) {
    sourceDBObj = sourceDB;
    Object.keys(aggregatedDB).forEach(dbName => {
      aggregateDBObj[dbName] = aggregatedDB[dbName]
    })
    rawSourceData = rawSource;
  }

  function addUserToDB(cleanSubmissionObj) {
    var userObject = new UserObj(cleanSubmissionObj);
    refitAppObj(userObject);
    addUserObjInDBStructure(userObject);
  }

  function addUserObjInDBStructure(userObject) {
    usersDBObj.index[userObject.email] = userObject.userId;
    usersDBObj.data[userObject.userId] = userObject;
  }

  function updateUserInDB(cleanSubmissionObj, isAnonymous) {
    var userObject = usersDBObj.data[cleanSubmissionObj.userId];
    var submissionAObj = Object.assign({}, cleanSubmissionObj.baseA);
    userObject.submisstionsAArr.unshift(submissionAObj);
    userObject.latestContactsUpdate = cleanSubmissionObj.timestamp;
    if (cleanSubmissionObj.fillCheck) { //If base is not empty i.e. the submitter refilled his data again
      var submissionBObj = Object.assign({}, cleanSubmissionObj.baseB);
      userObject.submisstionsBArr.unshift(submissionObj);
      userObject.userScore += cleanSubmissionObj.userScore;
      this.latestFullDataUpdate = cleanSubmissionObj.timestamp;
    }
    //Then proceed to normally filling up the activity data
    addEmailToEmailsArr(userObject);
    augementElements(userObject, cleanSubmissionObj, isAnonymous);
  }


  function UserObj(cleanSubmissionObj, isAnonymous) {
    var submissionObjA = Object.assign({}, cleanSubmissionObj.baseA);
    var submissionObjB = Object.assign({}, cleanSubmissionObj.baseB);
    Object.assign(this, userEntryObj);
    this.submissionsAArr = [submissionObjA];
    this.submissionsBArr = [submissionObjB];
    this.id = cleanSubmissionObj.userId;
    this.userScore = cleanSubmissionObj.userScore;
    this.emailsArr = [submissionObj.email];
    this.latestContactsUpdate = cleanSubmissionObj.timestamp;
    this.latestFullDataUpdate = cleanSubmissionObj.timestamp;
    augementElements(this, cleanSubmissionObj, isAnonymous);
  }

  function addEmailToEmailsArr(userObject) {
    var emailsArr = userObject.emailsArr
    var incomingEmail = userObject.submissionsArr[0].email;
    if (emailsArr.indexOf(incomingEmail) == -1) {
      emailsArr.unshift(incomingEmail);
    }
  }

  function augementElements(obj, cleanSubmissionObj, isAnonymous) {
    if (isAnonymous) {
      var role = "Confessor"
      obj.latestRole = role;
      obj.roles.unshift(role);
      var roleObj = new RoleHistoryObj(cleanSubmissionObj, role);
      obj.rolesHistory.unshift(roleObj);
      obj.susConfessions.push(cleanSubmissionObj.id);
    } else {
      var role = "Applicant"
      obj.latestRole = role;
      obj.roles.unshift(role);
      var roleObj = new RoleHistoryObj(cleanSubmissionObj, role);
      obj.rolesHistory.unshift(roleObj);
      var activityObj = new ActivityHistoryObj(cleanSubmissionObj);
      obj.activityHistory.push(activityObj);
    }
  }

  function RoleHistoryObj(cleanSubmissionObj, role) {
    Object.assign(this, roleHistoryObj);
    this.role = role;
    this.timestamp = cleanSubmissionObj.timestamp
  }

  function ActivityHistoryObj(cleanSubmissionObj) {
    Object.assign(this, activityHistoryObj);
    this.activity = cleanSubmissionObj.id;
    this.timestamp = cleanSubmissionObj.timestamp;
  }

  STRUCTURING_CCONE.initiateCCOne = initiateCCOne;
  STRUCTURING_CCONE.userEntryObj = userEntryObj;
  STRUCTURING_CCONE.addUserToDB = addUserToDB;
  STRUCTURING_CCONE.updateUserInDB = updateUserInDB;

  return STRUCTURING_CCONE;
})