const { Toolkit } = CCLIBRARIES
const { readFromJSON, writeToJSON } = Toolkit

// var app = new Gexpress.App()



// app.get(/.*/, function (req, res, next) { // default to homepage
//   res.set('content-type', 'text/html')
//   res.send(MW.render('client/index', { routedPage: "client/test", props: { name: "Mohamed" } }).getContent())
//   res.end()
// })

// app.get(/.*/, function (req, res, next) { // should be routed to filtering page
//   const entriesId = '1q53NgdwJg68num_cp797D_5greDv4w2v'
//   const entriesArray = readFromJSON(entriesId)
//   const stages = ['screening', 'interview', 'panel', 'final']
//   const filteringPath = 'client/pages/HumanManager/Filtering/filtering'
//   console.log(entriesArray)
//   res.set('content-type', 'text/html')
//   res.send(MW.render('client/index', { prerendered: false, routedPage: filteringPath, props: { entriesArray, stages } }, { ...renderOptions, title: "Community By CC" }).getContent())
//   res.end()
// })

// app.get('prerenders/filtering/:activityDivisionEventId', function (req, res, next) { // should be routed to filtering page
//   const { allEntries } = req.params
//   const [divisionType, divisionId, eventId] = activityDivisionEventId.split("-");
//   const mappedData = HUMAN_MANAGER.getAllMappedEntries({ allEntries, eventId, divisionId, divisionType });
//   PRERENDER.createPrerenders(path, { entriesArray: mappedData })
//   res.end()
// })

// app.get('prerendered/:path', function (req, res, next) { // should be routed to filtering page
//   res.send(MW.render('client/index', { routedPage: filteringPath, props: { prerender: true, path } }).getContent())
//   res.end()
// })

// this hooks Gexpress into appscript 
// function doGet(e) { return app.doGet(e) }
// function doPost(e) { return app.doPost(e) }

// function doGet(e) {
//   console.log(e)
//   const entriesId = '1q53NgdwJg68num_cp797D_5greDv4w2v'
//   const entriesArray = readFromJSON(entriesId)
//   const stages = ['screening', 'interview', 'panel', 'final']
//   const filteringPath = 'client/pages/HumanManager/Filtering/filtering'
//   return MW.render('client/index',
//     { prerendered: false, routedPage: filteringPath, props: { entriesArray, stages } }
//     , { ...renderOptions, title: "Community By CC" })
// }


function doGet(e) {
  return ROUTER.route(e)
}
