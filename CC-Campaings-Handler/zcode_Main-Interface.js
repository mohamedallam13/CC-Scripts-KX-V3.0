function doPost(e) {
    return CCLIBRARIES.MODULESEXPORT.postRequest(e,this)
}

function doGet(e) {
    return CCLIBRARIES.MODULESEXPORT.getRequest(e,this)
}

//////////////////////////////////////////////////////////

//API

function createNextGatheringsRound() {
  var requestObj = {
    request: "newEvent",
    division: "Events",
    activity: "CCG",
    season: "S9",
    roundName: "",
    roundCode: "SIXR5",
    sourceType: "GSheet",
    user: "galaxym88@gmail.com",
    // application_description: "welcome, < user >!",
    setDate: "2021-08-20T22:00:00.000Z",
    facebookGroupLink: "https://www.facebook.com/groups/ccgatheringsixr5",
    whatsappGroupLink: "https://chat.whatsapp.com/LxDaC10uSKTLMajYvOZjDM",
    talkingTopic: "Men's Mental Health"
  }
  var response = CAMPAIGNS_AUTOMATIC_HANDLER.handleRequest(requestObj);
  console.log(response);
}