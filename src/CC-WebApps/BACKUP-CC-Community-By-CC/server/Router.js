; (function (root, factory) {
    root.ROUTER = factory()
})(this, function () {

    const PATHS = {
        children: {
            devIndex: {
                children: {
                    admin: {
                        children: {
                            testFiltering: {
                                controller: CONTROLLER.testFilteringDev
                            }
                        }
                    }
                }

            },
            app: {
                children: {
                    testIn: {
                        controller: CONTROLLER.testIn
                    },
                    admin: {
                        // protected: true,
                        protectionReroute: CONTROLLER.getSignInPage,
                        children: {
                            testFiltering: {
                                controller: CONTROLLER.testFiltering
                            },
                            testProtected: {
                                controller: CONTROLLER.testIn
                            },
                            filtering: {
                                children: {
                                    _activityDivisionEventId: {
                                        protected: true,
                                        params: null,
                                        controller: CONTROLLER.getActivityFilteringList
                                    }
                                },

                            },
                            prerendered: {
                                children: {
                                    _path: {
                                        controller: CONTROLLER.getPrerenderedPaths
                                    }
                                }
                            }
                        }
                    },
                    magicLink: {
                        children: {
                            getLink: {
                                controller: CONTROLLER.getMagicLink
                            },
                            verfiyLink: {
                                controller: CONTROLLER.verifyMagicLink
                            }
                        }
                    },
                    defaultPath: {
                        controller: CONTROLLER.renderNotFound
                    }
                }
            },
            api: {
                children: {
                    prerenders: {
                        children: {
                            create: {
                                controller: CONTROLLER.createPrerenders
                            }
                        }
                    }
                },
                defaultPath: {
                    controller: null
                }
            },
            base: {
                controller: CONTROLLER.renderApp
            },
            defaultPath: {
                controller: CONTROLLER.renderApp
            }
        }
    }

    const route = function (e) {
        const { path = "", query, params } = getAllParameters(e)
        const pathArr = path.split("/").filter(el => el != "") || [];
        const pathObj = getPathObj(pathArr, params)
        return executePath({ path, query, params }, pathObj);
    }

    const getAllParameters = function (e) {
        const { pathInfo = "", parameters, postData = {} } = e
        const { content } = postData
        const params = content ? JSON.parse(postData?.content) : {};
        return { path: pathInfo, query: parameters, params }
    }

    const getPathObj = function (pathArr, params, currentNode = PATHS) {
        if (pathArr.length == 0) return currentNode.children.defaultPath;
        let protected = false;
        for (const node of pathArr) {
            let nextNode = currentNode.children?.[node];
            protected = currentNode.protected
            if (protected) {
                params.protected = currentNode.protectionReroute;
            }
            if (!nextNode) {
                const pathVariable = findPathVariable(currentNode);
                if (!pathVariable) return currentNode.children.defaultPath;
                else {
                    params[pathVariable.replace("_", "")] = node;
                    currentNode = currentNode.children?.[pathVariable];
                }
            } else {
                if (!nextNode.children) return nextNode
                currentNode = nextNode;
            }
        }
        return currentNode;
    }

    const findPathVariable = function (currentNode) {
        const firstVariable = Object.keys(currentNode.children = {}).find(value => /^_/.test(value));
        return firstVariable;
    }

    const executePath = function ({ path, query, params }, pathObj) {
        const req = { path, query, params }
        const res = { code: 400, success: false }
        let callBack;
        if (!pathObj.controller) callBack = CONTROLLER.renderApp
        else if (params.protected && !params.session?.user) callBack = params.protected;
        else callBack = pathObj.controller;
        return callBack(req, res);
    }

    return {
        route
    }
})

const testRouting = function () {
    const e = {
        pathInfo: "app",
        postData: {
            content: JSON.stringify({
                session: {

                },
                route: "testRouteOut"
            })
        }
    }
    ROUTER.route(e)
}

const routeString = function (e) {
    return ROUTER.route(e).getContent();
}