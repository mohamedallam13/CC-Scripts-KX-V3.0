; (function (root, factory) {
  root.DATA_COLLECTION = factory()
})(this, function () {
  const DATA_COLLECTION = {}


  ////
  // Facebook Fans Counter
  // Made by Martin Hassman, http://twitter.com/hassmanm
  // Released as Public Domain
  // Look at http://labs.met.cz/ for other tools
  //

  function FacebookFans(aPageId) {
    if (aPageId === undefined || aPageId === null) {
      throw "No parameter specified. Write Facebook PageID as parameter."
    }

    if (typeof aPageId != "number")
      throw "Parameter must be number.";

    // See http://developers.facebook.com/docs/reference/fql/page/ for API documentation
    var url = "http://api.facebook.com/method/fql.query?query=SELECT%20page_id,page_url,fan_count%20FROM%20page%20%20WHERE%20page_id=%22" + encodeURIComponent(aPageId) + "%22";

    var response = UrlFetchApp.fetch(url);

    if (response.getResponseCode() != 200)
      throw "Unexpected response code from Facebook.";

    var responseText = response.getContentText();
    console.log(responseText)
    if (responseText == null || responseText == "")
      throw "Empty response from Facebook.";

    var fan_count = 0;

    try {
      var xml = Xml.parse(responseText, false);
      var page = xml.getElement().getElement();

      if (page == null)
        throw "Wrong PageID.";

      fan_count = parseInt(page.getElement("fan_count").getText());
    }
    catch (e) {
      throw "Problem with response from Facebook: " + e;
    }

    return fan_count;
  }

  DATA_COLLECTION.FacebookFans = FacebookFans

  return DATA_COLLECTION
})

function FacebookFans(aPageId) {
  aPageId = 545566445484071;
  DATA_COLLECTION.FacebookFans(aPageId);
}