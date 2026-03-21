function onOpen() {

  var ui = SpreadsheetApp.getUi();
  var mainMenu = ui.createMenu("Actions")

  // var manageEvents = ui.createMenu("Manage Events")
    .addItem("Send Email Report", "createEmailReport")
  //  .addItem("Create Event From Creation", "testGetValuesFromCreation")
  //.addItem("Load CL Template", "loadCL")

  //  var manageStandardEmails = ui.createMenu("Standard Emails")
  //  .addItem("Load Template", "loadTemplate")
  //  .addItem("Save Template", "saveTemplate")
  //  
  //  var updateTemplates = ui.createMenu("Update Templates")
  //  .addItem("Update All Templates", "updateAllTemplates")


  //mainMenu.addSubMenu(manageEvents)
    //.addItem("Close Current Application", "loadCL")

    //  var manageStandardEmails = ui.createMenu("Standard Emails")
    //  .addItem("Load Template", "loadTemplate")
    //  .addItem("Save Template", "saveTemplate")
    //  
    //  var updateTemplates = ui.createMenu("Update Templates")
    //  .addItem("Update All Templates", "updateAllTemplates")


    //  mainMenu.addSubMenu(manageCL)
    //  .addSeparator()
    //  .addItem("Save All to DB", "saveAlltoDBFile")
    //  .addSeparator()
    //  .addItem("Load Application Elements", "loadAllApplicationElementsToJobManager")
    //  .addSeparator()
    //  .addItem("Send Application", "sendApplicationFromManager")
    //  .addSubMenu(manageStandardEmails)
    //  .addSeparator()
    //  .addSubMenu(updateTemplates)
    //  .addSeparator()
    //  .addItem("Save All to DB", "saveAlltoDBFile")
    .addToUi()

}