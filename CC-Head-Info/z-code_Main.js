; (function (root, factory) {
  root.HEAD_INFO = factory()
})(this, function () {

  var HEAD_INFO = {};

  var date
  const TIME_ZONE = "Africa/Cairo";
  const DATE_FORMAT = "dd.MM.YYYY HH:mm:ss"

  function createEmailReport() {
    getDate();
    var inputsObj = SHEETS_MANAGER.extractAllInputs();
    var variables = getVariablesFromInputsObj(inputsObj);
    augementParametersToVaribales(variables, inputsObj)
    EMAILING.createEmail(variables)
  }

  function getDate(){
    date = Utilities.formatDate(new Date(), TIME_ZONE, DATE_FORMAT)
   // Utilities.formatDate(new Date(), "Europe/Berlin", format);
  }

  function getVariablesFromInputsObj(inputsObj) {
    var variables = {};
    Object.keys(inputsObj).forEach(key => {
      var variableObj = inputsObj[key];
      variables[key] = variableObj.value;
    })
    return variables;
  }

  function augementParametersToVaribales(variables, inputsObj) {
    addSelectedBodyTemplate(variables, inputsObj);
    addRecipients(variables);
    addTimestamp(variables);
  }

  function addSelectedBodyTemplate(variables, inputsObj) {
    var selectedBodyUserHeader = variables.selected_body_template;
    for (let key in inputsObj) {
      var variableObj = inputsObj[key];
      var userHeader = variableObj.userHeader;
      if (userHeader == selectedBodyUserHeader) {
        variables.emailBodyTemplate = variableObj.value;
        return;
      }
    }
  }

  function addRecipients(variables){
    variables.emailRecipients = variables.emails_list.join(",");
  }

  function addTimestamp(variables){
    variables.timestamp = date;
  }

  HEAD_INFO.createEmailReport = createEmailReport;
  return HEAD_INFO
})

function createEmailReport() {
  HEAD_INFO.createEmailReport();
}