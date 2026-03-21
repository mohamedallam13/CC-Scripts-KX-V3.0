; (function (root, factory) {
    root.modulesRequire = factory()
  })(this, function () {
  
    var modulesRequire = function (url) {
      function ModuleObj() {
        // this.url = url.includes(".") ? url : `https://script.google.com/macros/s/${url}/exec`;
        this.url = url;
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