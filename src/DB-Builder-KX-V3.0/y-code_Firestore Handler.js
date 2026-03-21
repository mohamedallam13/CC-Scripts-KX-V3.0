; (function (root, factory) {
  root.firebaseHandler = factory()
})(this, function () {

  function firebaseHandler(url) {
    var db = connect(url);
    const firebaseHInstance = {
      setData: function (dbName, obj) {
        db.setData(dbName, obj)
      }
    }
    return firebaseHInstance
  }

  function connect(url) {
    var token = ScriptApp.getOAuthToken()
    var db = FirebaseApp.getDatabaseByUrl(url, token);
    return db
  }

  return firebaseHandler
})