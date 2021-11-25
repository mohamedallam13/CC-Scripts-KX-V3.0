; (function (root, factory) {
  root.REFERENCES_MANAGER = factory()
})(this, function () {

  const REFERENCES_MANAGER = {};

  const DEFAULT_MASTER_INDEX_FILE_ID = "18v8jqGGsu3PYmLWkFH0tFVSqhQzMJfsn";
  var masterIndexId;

  function init(masterFileId) {
    masterIndexId = masterFileId || DEFAULT_MASTER_INDEX_FILE_ID
    const referencesRequireObj = {
      masterIndex: Toolkit.readFromJSON(masterIndexId),
      requiredFiles: {},
      requireFiles: function (fileLabels) {
        var requireFilesLables = Object.keys(this.requiredFiles);
        self = this;
        if (!Array.isArray(fileLabels)) {
          fileLabels = [fileLabels];
        }
        fileLabels.forEach(fileLabel => {
          console.log(fileLabel);
          var fileId = self.masterIndex[fileLabel];
          if (!fileId) {
            console.log("File not in Index");
            return;
          }

          if (requireFilesLables.includes(fileLabel)) {
            console.log("File already required");
            return;
          }

          var fileContent = Toolkit.readFromJSON(fileId);
          self.requiredFiles[fileLabel] = {};
          self.requiredFiles[fileLabel].fileId = fileId;
          self.requiredFiles[fileLabel].fileContent = fileContent;
          self.requiredFiles[fileLabel].update = function () {
            var requiredFile = self.requiredFiles[fileLable];
            var fileId = requiredFile.fileId;
            var data = requiredFile.fileConent;
            Toolkit.writeToJSON(data, fileId);
          };
          self.requiredFiles[fileLabel].reRead = function () {
            var requiredFile = self.requiredFiles[fileLable];
            var fileId = requiredFile.fileId;
            self.requiredFiles[fileLable].fileContent = Toolkit.readFromJSON(fileId);
            return this;
          }
        })
        return this;
      }
    }
    return referencesRequireObj;
  }

  REFERENCES_MANAGER.init = init;
  REFERENCES_MANAGER.defaultReferences = init();

  return REFERENCES_MANAGER;
})


function test() {
  var files = ["divisionsProperties"];
  REFERENCES_MANAGER.defaultReferences.requiredFiles.divisionsProperties.reRead();
  var k
}
