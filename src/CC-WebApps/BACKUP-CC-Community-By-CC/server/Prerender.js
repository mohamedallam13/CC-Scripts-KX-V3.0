; (function (root, factory) {
    root.PRERENDER = factory()
})(this, function () {
    const { REFERENCES_MANAGER } = CCLIBRARIES
    const REQUIRED_REFERENCES = ["prerendersIndex"];

    let referencesObj


    function getReferences() {
        referencesObj = REFERENCES_MANAGER.init(MASTER_FILE_INDEX).requireFiles(REQUIRED_REFERENCES).requiredFiles;
    }

    function getPrerenderedIndex() {
        return referencesObj.prerendersIndex.fileContent;
    }

    function updatePrerenderContent(path, HTMLContent) {
        const { fileContent } = referencesObj.prerendersIndex;
        fileContent[path].content = HTMLContent;
        referencesObj.prerendersIndex.update(fileContent)
    }

    function createPrerenders(path, props) {
        getReferences();
        const prerenderedIndex = getPrerenderedIndex();
        const { page } = prerenderedIndex[path];
        const HTMLContent = MW.include(page, props);
        updatePrerenderContent(path, HTMLContent);
    }

    function loadPrerender(path) {
        getReferences();
        const prerenderedIndex = getPrerenderedIndex();
        const { content } = prerenderedIndex[path];
        return content
    }

    return {
        createPrerenders,
        loadPrerender
    }
})

const loadPrerender = function(path){
    PRERENDER.loadPrerender(path)
}
