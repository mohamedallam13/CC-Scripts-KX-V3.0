; (function (root, factory) {
  root.modulesRequire = factory()
})(this, function () {

  var modulesRequire = function (urlObj, isDevDeployment) {
    function ModuleObj() {
      // this.url = url.includes(".") ? url : `https://script.google.com/macros/s/${url}/exec`;
      this.url = isDevDeployment ? urlObj.devDeployment : urlObj.scriptURL;
      console.log(this.url)
      this.post = function (requestObj) {
        return callURL(this.url, requestObj, "post");
      };
      this.get = function (requestObj) {
        return callURL(this.url, requestObj, "get");
      }
    }

    return new ModuleObj();
  }

  function callURL(url, requestObj, method) {
    var load = {};
    load.event = {};
    load.event.requestObj = requestObj;
    var payload = JSON.stringify(load);
    var options = {
      'method': method,
      payload: payload,
    }
    var response = UrlFetchApp.fetch(url, options);
    console.log(response)
    var responseText = response.getContentText();
    try {
      var responseObj = JSON.parse(responseText);
    } catch (e) {
      return { fetchError: e, sourceError: responseText };
    }
    return responseObj;
  }

  return modulesRequire
})

function testRequireModule() {
  const REQUIRED_REFERENCES = ["deployedScripts"];
  var referencesObj = REFERENCES_MANAGER.defaultReferences.requireFiles(REQUIRED_REFERENCES).requiredFiles;
  const ccCampaignsHandler = referencesObj.deployedScripts.fileContent.CCCAMPHNDLR;
  var APIObj = modulesRequire(ccCampaignsHandler);
  console.log(APIObj)
}