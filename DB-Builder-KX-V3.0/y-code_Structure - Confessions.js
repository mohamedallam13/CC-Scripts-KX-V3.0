; (function (root, factory) {
  root.CONFESSIONS = factory()
})(this, function () {

  var CONFESSIONS = {};

  const MULTIPLIER = 10000;

  var confessionsColumn
  var rawSourceData

  function init(confessCol, rawSource) {
    confessionsColumn = confessCol;
    rawSourceData = rawSource;
  }

  function getSerial(cleanSubmissionObj) {
    var confessionText = cleanSubmissionObj.mapped.Confession;
    var confessionIndex = confessionText.indexOf(confessionsColumn);
    var serialNumber = ((parseInt(rawSourceData["#"]) + 1) * MULTIPLIER) + confessionIndex + 1;
    return serialNumber;
  }

  CONFESSIONS.init = init;
  CONFESSIONS.getSerial = getSerial;

  return CONFESSIONS;
})