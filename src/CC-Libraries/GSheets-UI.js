;(function(root,factory){
  root.SHEETS_UI = factory()
})(this,function(){
  
  var SHEETS_UI = {};
  
  function popoutErrorMessges(title,message){
    var ui = SpreadsheetApp.getUi(); // Same variations.
    var result = ui.alert(
      title,
      message,
      ui.ButtonSet.OK);
      return result;
  }
  
  function yesNoMessage(title,message){
    var ui = SpreadsheetApp.getUi(); // Same variations.
    var result = ui.alert(
      title,
      message,
      ui.ButtonSet.YES_NO);
    if (result == ui.Button.YES) {
      return true;
    }
    return false;
  }
  
  function popupText(message){
    var input = Browser.inputBox(message);
    return input;
  }
  
  SHEETS_UI.popoutErrorMessges = popoutErrorMessges;  
  SHEETS_UI.yesNoMessage = yesNoMessage;  
  SHEETS_UI.popupText = popupText;  
  
  return SHEETS_UI
})
