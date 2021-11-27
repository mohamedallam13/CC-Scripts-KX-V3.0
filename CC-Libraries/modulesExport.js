; (function (root, factory) {
    root.MODULESEXPORT = factory()
})(this, function () {

    const MODULESEXPORT = {};

    function getRequest(e, scope) {
        var payload = JSON.parse(e.postData.contents).event;
        var process = payload.requestObj.process;
        var response = getMethod(scope, process)(payload.requestObj);
        try {
            var convertedResponse = ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
        } catch (e) {
            return e;
        }
        return convertedResponse;
    }

    function postRequest(e, scope) {
        var payload = JSON.parse(e.postData.contents).event;
        var process = payload.requestObj.process;
        var response = getMethod(scope, process)(payload.requestObj);
        try {
            var convertedResponse = ContentService.createTextOutput(JSON.stringify(response)).setMimeType(ContentService.MimeType.JSON);
        } catch (e) {
            return e;
        }
        return convertedResponse;
    }

    function getMethod(scope, process) {
        var processArr = process.split(".");
        var targetMethod;
        processArr.forEach(method => {
            if (!targetMethod) {
                targetMethod = scope[method];
            } else {
                targetMethod = targetMethod[method];
            }
        })
        return targetMethod;
    }

    MODULESEXPORT.getRequest = getRequest;
    MODULESEXPORT.postRequest = postRequest;

    return MODULESEXPORT

})

