function onOpen(){
  
  var ui = SpreadsheetApp.getUi();
  var mainMenu = ui.createMenu("Compiler Manager");
  
  var manageSources = ui.createMenu("Manage Sources")
  .addItem("Add New Source", "addNewSourceManual")
  .addItem("Add Source Headers", "addSourceHeaders")
  .addItem("Complete Source Info", "completeInfo")
  .addItem("Activate Sources", "activateSources")
  
  mainMenu.addSubMenu(manageSources)
  .addSeparator()
  .addItem("Add/Remove sheet to sources","addRemoveSourcesSection")
  .addSeparator()
  .addItem("Clear All Sources", "clearSources")
  .addSeparator()
  .addItem("Create Source File", "createSourcesFile")
  .addToUi()
  
}