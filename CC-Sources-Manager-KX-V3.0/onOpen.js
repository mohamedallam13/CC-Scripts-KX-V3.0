function onOpen() {

  var ui = SpreadsheetApp.getUi();
  var mainMenu = ui.createMenu("Actions");

  var manageSources = ui.createMenu("Manage Sources")
    .addItem("Complete Sources in this Sheet", "completeSourcesForActivity")
    .addItem("Complete all Sources", "completeAllSources")
    .addItem("Activate Sources (Map Completed)", "activateSources")

  var manageSourcesFile = ui.createMenu("Manage Sources Index")
    .addItem("Reset Sources", "resetSources")

  mainMenu.addSubMenu(manageSources)
    .addSeparator()
    .addSubMenu(manageSourcesFile)

    // .addSeparator()
    // .addItem("Add/Remove sheet to sources","addRemoveSourcesSection")
    // .addSeparator()
    // .addItem("Clear All Sources", "clearSources")
    // .addSeparator()
    // .addItem("Create Source File", "createSourcesFile")
    .addToUi()

}