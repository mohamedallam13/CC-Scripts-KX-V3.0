// ; (function (root, factory) {
//     root.HUMAN_MANAGER = factory()
// })(this, function () {
//     const DB_ID = "1xvgAqwFUlbUrpiXY_uzO0V1bytEjUcrA"

//     const { Toolkit } = CCLIBRARIES
//     const { readFromJSON, writeToJSON } = Toolkit

//     const getWorkingDocument = function () {
//         return readFromJSON(DB_ID).data
//     }

//     const updateStage = function (id, nextStage) {
//         const fileObj = readFromJSON(DB_ID);
//         const { data } = fileObj
//         data[id].nextStage = nextStage;
//         writeToJSON(DB_ID, fileObj)
//     }

//     const deployStage = function () {

//     }

//     return {
//         getWorkingDocument,
//         updateStage,
//         deployStage
//     }
// })