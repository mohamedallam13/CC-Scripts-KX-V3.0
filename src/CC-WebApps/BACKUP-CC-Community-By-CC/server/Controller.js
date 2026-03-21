; (function (root, factory) {
    root.CONTROLLER = factory()
})(this, function () {

    const { Toolkit } = CCLIBRARIES
    const { readFromJSON, writeToJSON } = Toolkit

    const renderOptions = {
        favIcon: HELPERS.getFavIconFromLink("https://drive.google.com/file/d/112klNXnqobGTyFlADSVdHSIB7in4b-4F/view?usp=sharing"),
        metaData: [
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1"
            }
        ]
    }

    //Top level

    const renderApp = function (req) {
        console.log("rendering app!")
        const { path, query } = req
        return MW.render('client/app', { path, query }, { ...renderOptions, title: "Community By CC" })
    }

    // Page level (fetched with render from App)

    // Test

    const testOut = function (req, res) {
        console.log(req)
    }

    const testIn = function (req, res) {
        console.log(req)
        const testingPath = 'client/test'
        return MW.render('client/index',
            { prerendered: false, routedPage: testingPath, props: {} })
    }

    const testVariable = function (req, res) {
        console.log(req)
    }

    const testFiltering = function (req, res) {
        const entriesId = '1q53NgdwJg68num_cp797D_5greDv4w2v'
        const entriesArray = readFromJSON(entriesId)
        const stages = ['screening', 'interview', 'panel', 'final']
        const filteringPath = 'client/pages/HumanManager/Filtering/filtering'
        return MW.render('client/index',
            { prerendered: false, routedPage: filteringPath, props: { entriesArray, stages } })
    }

    const testFilteringDev = function (req, res) {
        const entriesId = '1q53NgdwJg68num_cp797D_5greDv4w2v'
        const entriesArray = readFromJSON(entriesId)
        const stages = ['screening', 'interview', 'panel', 'final']
        const filteringPath = 'client/pages/HumanManager/Filtering/filtering'
        return MW.render('client/devIndex',
            { prerendered: false, routedPage: filteringPath, props: { entriesArray, stages } })
    }

    // Non prerendered (Hot) (from App)

    const getActivityFilteringList = function (req) {
        const { activityDivisionEventId } = req.params;
        const [divisionType, divisionId, eventId] = activityDivisionEventId.split("-");
        const mappedData = HUMAN_MANAGER.getAllMappedEntries({ allEntries, eventId, divisionId, divisionType });
        return MW.render('client/index', { routedPage: "client/Filtering/filtering", props: { prerendered: false, entriesArray: mappedData } })
    }

    // Prerendered (from App)

    const getPrerenderedPaths = function (req) {
        const { path } = req;
        return MW.render('client/index', { routedPage: "", props: { prerendered: true, path } }).getContent()
    }

    // API paths

    const createPrerenders = function (req, res) {
        //Coming from Outside (API)
        const { activityDivisionEventId, allEntries } = req.params;
        const [divisionType, divisionId, eventId] = activityDivisionEventId.split("-");
        const mappedData = HUMAN_MANAGER.getAllMappedEntries({ allEntries, eventId, divisionId, divisionType });
        PRERENDER.createPrerenders(path, { entriesArray: mappedData })
        res.success = true
        return res
    }

    // Sign in Pages (from App)

    const getSignInPage = function (req) {
        const { user } = req.params.session
        if (user) return MW.render('client/index', { routedPage: "home", props: { prerendered: false } }).getContent()
        return MW.render('client/index', { routedPage: "client/SignIn/signIn", props: { prerendered: false } }).getContent()
    }

    const getMagicLink = function (req) {
        const { email } = req.params
        const token = getToken();
        setLogs(email, { token });
        const magicLink = createMagicLink(token);
        EMAILS.send({ template: "magicLinks", email, magicLink })
        return MW.render('client/index', { routedPage: "client/SigningIn/checkMagicLink", props: { prerendered: false } }).getContent()
    }

    const verifyMagicLink = function (req) {
        const { email_token } = req.params
        const [email, token] = email_token.split("-");
        const foundToken = getFromLogs(email, "token");
        if (foundToken == token) {
            const user = HUMAN_MANAGER.getUserByEmail(email);
            return MW.render('client/signingIn', { user }).getContent()
        } else {
            return MW.render('client/index', { routedPage: "client/Broken/magicLinkExpired", props: { prerendered: false } }).getContent()
        }
        //check the logs
        //if yes load userId from DB
    }


    return {
        renderApp,
        testFiltering,
        getActivityFilteringList,
        getPrerenderedPaths,
        createPrerenders,
        getSignInPage,
        getMagicLink,
        verifyMagicLink,
        testOut,
        testIn,
        testVariable,
        testFilteringDev
    }
})