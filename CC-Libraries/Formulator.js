; (function (root, factory) {
  root.FORMULATOR = factory()
})(this, function () {

  const FORMULATOR = {};

  function createFormsInstance(formId) {
    var formApp = FormApp.openById(formId);
    const FormInstance = {
      id: formId,
      formApp: formApp,
      formFileName: DriveApp.getFileById(formId).getName(),
      formTitle: formApp.getTitle(),
      editURL: formApp.getEditUrl(),
      publishedURL: formApp.getPublishedUrl(),
      shortenedpublishedURL: formApp.shortenFormUrl(formApp.getPublishedUrl()),
      responsesSheetId: null,
      responsesSheet: null,
      responsesSheetURL: null,
      setResponsesSheetData: function () {
        var responsesSheetId = getResponsesDestination(formApp);
        if (responsesSheetId) {
          this.responsesSheetId = responsesSheetId
          this.responsesSheet = SpreadsheetApp.openById(responsesSheetId);
          this.responsesSheetURL = this.responsesSheet.getUrl();
        }
        return this;
      },
      isAccepting: function (bool) {
        if (typeof bool == "boolean") {
          this.formApp.setAcceptingResponses(bool);
          return this;
        }
        return this.formApp.isAcceptingResponses();
      },
      title: function (title) {
        if (!title) {
          return this.formApp.getTitle();
        }
        this.formApp.setTitle(title);
        this.formTitle = title;
        return this;
      },
      fileName: function (name) {
        var file = DriveApp.getFileById(this.id);
        if (!name) {
          return file.getName();
        }
        file.setName(name);
        this.formName = name;
        return this;
      },
      description: function (description) {
        if (!description) {
          return this.formApp.getDescription();
        }
        this.formApp.setDescription(description);
        return this;
      },
      confirmation: function (confirmation) {
        if (!confirmation) {
          return this.formApp.getConfirmationMessage();
        }
        this.formApp.setConfirmationMessage(confirmation);
        return this;
      },
      closedForm: function (closedForm) {
        if (!closedForm) {
          return this.formApp.getCustomClosedFormMessage();
        }
        this.formApp.setCustomClosedFormMessage(closedForm);
        return this;
      },
      formEditors: function (editors) {
        if (!editors) {
          return this.formApp.getEditors();
        }
        this.formApp.addEditor(editors);
        return this;
      },
      resultsEditors: function (editors) {
        if (!editors) {
          return this.responsesSheet.getEditors();
        }
        this.responsesSheet.addEditor(editors);
        return this;
      },
      copyForm: function (folderObj, name, title) {
        name = name || this.fileName;
        title = title || this.title;
        var file = DriveApp.getFileById(formId);
        var copyFile = file.makeCopy();
        copyFile.moveTo(folderObj);
        var newFormId = copyFile.getId();
        var newInstance = createFormsInstance(newFormId).isAccepting(true).title(title).fileName(name).createFormResponseSheet(folderObj, name);
        return newInstance;
      },
      createFormResponseSheet: function (folderObj, name) {
        name = name || this.formName;
        this.responsesSheet = SpreadsheetApp.create(name + " (Responses)");
        this.responsesSheetId = this.responsesSheet.getId();
        this.responsesSheetURL = this.responsesSheet.getUrl();
        this.formApp.setDestination(FormApp.DestinationType.SPREADSHEET, this.responsesSheetId);
        var ssFile = DriveApp.getFileById(this.responsesSheetId);
        ssFile.moveTo(folderObj);
        return this;
      }
    }
    return FormInstance;
  }

  function getResponsesDestination(formApp) {
    var responsesSheetId;
    try {
      responsesSheetId = formApp.getDestinationId()
    } catch (e) {
      console.log(e);
      responsesSheetId = null
    }
    return responsesSheetId;
  }

  FORMULATOR.createFormsInstance = createFormsInstance;
  return FORMULATOR;
})

