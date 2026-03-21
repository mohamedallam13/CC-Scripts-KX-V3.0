; (function (root, factory) {
    root.HUMAN_MANAGER = factory()
})(this, function () {

    const { Toolkit, _, REFERENCES_MANAGER } = CCLIBRARIES
    const { readFromJSON, writeToJSON } = Toolkit
    const REQUIRED_REFERENCES = ["divisionsProperties", "deployedScripts"];
    const MASTER_FILE_INDEX = "1ohC9kPnMxyptp8SadRBGAofibGiYTTev"

    // let CCAPPLICATIONSBACKEND

    let referencesObj
    let configs

    const getReferences = function () {
        getRequiredIndexes();
        // getRequiredScripts();
    }

    function getRequiredIndexes() {
        referencesObj = REFERENCES_MANAGER.init(MASTER_FILE_INDEX).requireFiles(REQUIRED_REFERENCES).requiredFiles;
    }

    // function getRequiredScripts() {
    //     const ccApplicationsBackend = referencesObj.deployedScripts.fileContent.CCAPPLICATIONSBACKEND;
    //     CCAPPLICATIONSBACKEND = modulesRequire(ccApplicationsBackend);
    // }

    function getConfigs({ divisionId, divisionType }) {
        configs = referencesObj.divisionsProperties.fileContent[divisionType][divisionId];
    }

    function getAllMappedEntries({ allEntries, eventId, divisionId, divisionType }) {
        getReferences();
        getConfigs({ divisionId, divisionType })
        if (!allEntries) allEntries = getAllEntries({ eventId, divisionId })
        const mappedData = getMappedData(allEntries);
        return mappedData;
    }

    function getAllEntries(){
        const response = APPLICATIONSBACKEND.handleRequest({ path: "getAllFullApplications", eventId, divisionId })
        if (!response) return []
        const { data } = response;
        return data;
    }

    function getEntry(request) {
        getReferences();
        const response = APPLICATIONSBACKEND.handleRequest(request)
        console.log(response.data)
        // const response = GSCRIPT_ROUTER.route(request)
        if (response.sourceError || response.fetchError) {
            console.log(response.sourceError);
            console.log(response.fetchError);
            return
        }
        return response
    }

    function getMappedData(data) {
        const { filteringMap } = configs;
        const mappedData = data.map(entry => {
            const mappedDataObj = {}
            replaceValue(filteringMap, entry, mappedDataObj)
            return mappedDataObj
        })
        return mappedData
    }

    function replaceValue(obj, entry, mappedDataObj) {
        if (Array.isArray(obj)) {
            return obj.map(element => {
                return replaceValue(element, entry, {})
            })
        } else if (typeof obj == 'object') {
            if (obj.hasOwnProperty("value")) {
                let { value } = obj;
                value = getValueFromEntry(value, entry)
                return { ...obj, value }
            } else {
                Object.entries(obj).forEach(([key, subObj]) => {
                    mappedDataObj[key] = replaceValue(subObj, entry, {})

                })
                return mappedDataObj;
            }
        } else {
            return obj
        }

    }

    function getValueFromEntry(value, entry) {
        const path = value.split(".");
        let returnValue
        path.forEach(param => {
            returnValue = returnValue ? returnValue[param] : entry[param]
            if (Array.isArray(returnValue)) {
                returnValue = returnValue[0]
            }
        })
        return returnValue || ""
    }



    return {
        getAllMappedEntries,
        getEntry
    }
})

function getAllEntries() {
    const allEntriesToWrite = HUMAN_MANAGER.getAllEntries({ divisionType: "Activities", divisionId: "CCG", eventId: "SIR3" });
    console.log(allEntriesToWrite)
}

function getEntry() {
    HUMAN_MANAGER.getEntry({ path: "getFullApplicationByEmail", divisionType: "Activities", divisionId: "CCG", eventId: "SIR2", email: "mahmoud.salama77@gmail.com" })
}

function testCompile() {
    console.log("Compiled!")
}