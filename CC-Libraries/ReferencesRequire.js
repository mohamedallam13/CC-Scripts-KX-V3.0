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
          self.requiredFiles[fileLabel] = new ReferenceObj(fileId, fileContent, fileLabel, self);
        })

        function ReferenceObj(fileId, fileContent, fileLabel, self) {
          this.fileId = fileId;
          this.fileContent = fileContent;
          this.update = function (data) {
            var requiredFile = self.requiredFiles[fileLabel];
            var fileId = requiredFile.fileId;
            data = data || requiredFile.fileContent;
            Toolkit.writeToJSON(data, fileId);
            return self
          };
          this.reRead = function () {
            var requiredFile = self.requiredFiles[fileLabel];
            var fileId = requiredFile.fileId;
            self.requiredFiles[fileLable].fileContent = Toolkit.readFromJSON(fileId);
            return self;
          }
        }

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
