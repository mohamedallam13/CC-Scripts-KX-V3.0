; (function (root, factory) {
  root.TRIGGERS_MANAGER = factory()
})(this, function () {

  var TRIGGERS_MANAGER = {};

  var scriptProperties;
  const CNT_TRG_PREFIX = "cntTrg";

  function setContinutaionTrigger(command) {
    initiateProperties()
    var continueTriggerCheck = checkContinueTrigger();
    if (continueTriggerCheck) {
      console.log("Continuing..");
      return
    }
    createContinueTrigger(command);
    console.log("Starting..");
  }

  function deleteContinuationTrigger(command) {
    var key = CNT_TRG_PREFIX + "_" + command;
    scriptProperties.deleteProperty(key)
    var triggerId = scriptProperties.getProperty(key);
    var triggers = ScriptApp.getProjectTriggers()
    for (i in triggers) {
      if ((triggers[i].getUniqueId()) == triggerId) {
        ScriptApp.deleteTrigger(triggers[i])
      }
    }
    console.log("Opertaion Complete")
  }

  function initiateProperties() {
    scriptProperties = PropertiesService.getScriptProperties();
  }

  function checkContinueTrigger() {
    var allPropertiesKeys = scriptProperties.getKeys();
    var cntTrgRegex = new RegExp(CNT_TRG_PREFIX);
    var continueTrigger = allPropertiesKeys.map(key => cntTrgRegex.test(key));
    var continueTriggerCheck = continueTrigger.length != 0;
    return continueTriggerCheck
  }

  function createContinueTrigger(command) {
    var triggerObj = ScriptApp.newTrigger(command).timeBased().everyMinutes(1).create();
    var id = triggerObj.getUniqueId();
    scriptProperties.setProperty(CNT_TRG_PREFIX + "_" + command, id)
  }

  TRIGGERS_MANAGER.setContinutaionTrigger = setContinutaionTrigger;
  TRIGGERS_MANAGER.deleteContinuationTrigger = deleteContinuationTrigger;

  return TRIGGERS_MANAGER
})