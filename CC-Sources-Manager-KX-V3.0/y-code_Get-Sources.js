; (function (root, factory) {
    root.SHEETS_ARRAY = factory()
})(this, function () {

    var SHEETS_ARRAY = [];

    const REFERENCES_MANAGER = CCLIBRARIES.REFERENCES_MANAGER;

    const REQUIRED_REFERENCES = ["divisionsProperties"];

    var referencesObj;

    function getSources() {
        getReferences();
        createSheetsArray();
    }

    function getReferences() {
        referencesObj = REFERENCES_MANAGER.defaultReferences.requireFiles(REQUIRED_REFERENCES).requiredFiles;
    }

    function createSheetsArray() {
        var divisionsPropertiesObj = referencesObj.divisionsProperties;
        var divisionProperties = divisionsPropertiesObj.fileContent;
        var allDivisions = Object.keys(divisionProperties);
        allDivisions.forEach(divisionLabel => {
            var divisionObj = divisionsProperties[divisionLabel];
            var activities = Object.keys(divisionObj);
            SHEETS_ARRAY = SHEETS_ARRAY.concat(activities);
        })
    }

    getSources();

    return SHEETS_ARRAY

})