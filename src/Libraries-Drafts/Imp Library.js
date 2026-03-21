/* global SpreadsheetApp, DriveApp, Utilities, Session */

(function (root, factory) {
    root.imp = factory()
}(this, function () {
    /**
     * @typedef imp
     * @type {Object}
     * @property {Object} tools
     * @property {function} createSpreadsheetManager
     */
    var imp = {}

    /**
     * @memberof imp
     * @param {string} [docId] Google's document ID
     * @returns {spreadsheetManager}
     */
    function createSpreadsheetManager(docId) {
        docId = docId || ''
        if (typeof docId !== 'string') {
            throw new TypeError('"docId" must be "string"')
        }

        var Spreadsheet = (docId === '') ? SpreadsheetApp.getActiveSpreadsheet()
            : SpreadsheetApp.openById(docId)
        if (docId === '') {
            docId = Spreadsheet.getId()
        }

        /**
         * @typedef spreadsheetManager
         * @type {Object}
         * @property {string} docId
         * @property {Object} Spreadsheet [Google Apps Class]{@link https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet}
         * @property {Object.<sheetManager>} sheets
         * @property {function} addSheets
         */
        var spreadsheetManager = {
            docId: docId,
            Spreadsheet: Spreadsheet,
            sheets: {},
            /**
             * @memberof spreadsheetManager
             * @param {(Array.<string>|string)} names array of sheet names or a single sheet name
             * @returns {spreadsheetManager}
             */
            addSheets: function (names) {
                var self = this

                function getSheetByName(name) {
                    if (!self.sheets[name]) {
                        self.sheets[name] = createSheetManager(self.Spreadsheet, name)
                    }
                }

                if (typeof names === 'string') {
                    getSheetByName(names)
                } else if (Array.isArray(names)) {
                    names.forEach(getSheetByName)
                } else {
                    throw new TypeError('"names" must be "string" or "Array"')
                }
                return this
            }
        }
        return spreadsheetManager
    }

    /**
     * @param {Object} Spreadsheet [Google Apps Class]{@link https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet}
     * @param {string} name name of the sheet/tab
     * @returns {sheetManager}
     */
    function createSheetManager(Spreadsheet, name) {
        if (typeof Spreadsheet.getSheetByName !== 'function') {
            throw new TypeError('"Spreadsheet" must be Google Apps class "Spreadsheet"')
        }
        if (typeof name !== 'string') {
            throw new TypeError('"name" must be "string"')
        }

        var Sheet = Spreadsheet.getSheetByName(name)
        if (Sheet === null) {
            throw new Error('"' + name + '" does not exist in ' +
                Spreadsheet.getName())
        }

        /**
         * @typedef sheetManager
         * @type {Object}
         * @property {Object} Spreadsheet [Google Apps Class]{@link https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet}
         * @property {Object} Sheet [Google Apps Class]{@link https://developers.google.com/apps-script/reference/spreadsheet/sheet}
         * @property {number} headerRow
         * @property {number} lastRow,
         * @property {number} firstRow
         * @property {number} skipRows
         * @property {number} lastCol
         * @property {Array.<string, number, Date>} header
         * @property {Array.<Array.<string, number, Date>>} values updated by parseSheet
         * @property {boolean} isEmpty
         * @property {Array.<Object>} objectifiedValues updated by objectifyValues
         * @property {Object.<Object>} indexedValues updated by indexObjectifiedValues
         * @property {function} parseSheet
         * @property {function} objectifyValues
         * @property {function} columnToArray
         * @property {function} indexObjectifiedValues
         * @property {function} validateHeader
         */
        var sheetManager = {
            Spreadsheet: Spreadsheet,
            Sheet: Sheet,
            headerRow: 0,
            lastRow: 0,
            firstRow: 0,
            skipRows: 0,
            lastCol: 0,
            header: [],
            values: [],
            isEmpty: true,
            objectifiedValues: [],
            column: {},
            indexedValues: {},

            /**
             * Parse a sheet and retrieve it's data as 2D-Array (outer array represents
             * rows, inner represents columns/cells)
             * @memberof sheetManager
             * @param {Object} [options] configuration object
             * @param {number} [options.headerRow=1] row that contains header cells
             * @param {number} [options.skipRows=0] Skip parsing a specific number of rows after the header
             * @param {string} [options.countRowsByCol] count rows by a specific column
             * @param {(Object|Array)} [options.sortSpecObj] [Google Apps sortSpecObj]{@link https://developers.google.com/apps-script/reference/spreadsheet/range#sort(Object)}<br>sort cells before fetching the values
             * @param {boolean} [options.dynamicTyping=false] enable type-conversion according to the number format in each cell
             * @returns {sheetManager}
             */
            parseSheet: function (options) {
                options = options || {}
                if (Object.prototype.toString.call(options) !== '[object Object]') {
                    throw new TypeError('"options" must be "Object"')
                }

                options.headerRow = options.headerRow || 1
                if (typeof options.headerRow !== 'number') {
                    throw new TypeError('"headerRow" must be "number"')
                }
                this.headerRow = options.headerRow

                options.skipRows = options.skipRows || 0
                if (typeof options.skipRows !== 'number') {
                    throw new TypeError('"skipRows" must be "number"')
                }
                this.skipRows = options.skipRows

                options.countRowsByCol = options.countRowsByCol || ''
                if (typeof options.countRowsByCol !== 'string') {
                    throw new TypeError('"countRowsByCol" must be "string"')
                }

                if (typeof options.dynamicTyping === 'undefined') {
                    options.dynamicTyping = false
                }
                if (typeof options.dynamicTyping !== 'boolean') {
                    throw new TypeError('"dynamicTyping" must be "boolean"')
                }

                this.firstRow = this.headerRow + this.skipRows + 1
                this.lastRow = Sheet.getLastRow()
                if (this.lastRow < this.firstRow) this.lastRow = this.firstRow
                this.lastCol = Sheet.getLastColumn()
                this.header = Sheet.getRange(this.headerRow, 1, 1, this.lastCol)
                    .getDisplayValues()[0]

                if (options.sortSpecObj) {
                    Sheet.getRange(this.firstRow, 1, this.lastRow - (this.headerRow + this.skipRows),
                        this.lastCol)
                        .sort(options.sortSpecObj)
                    SpreadsheetApp.flush()
                    this.lastRow = Sheet.getLastRow()
                }

                if (options.countRowsByCol) {
                    var tmpVals = this.Sheet.getRange(options.countRowsByCol +
                        (this.firstRow) + ':' + options.countRowsByCol)
                        .getDisplayValues()
                    for (var index = tmpVals.length - 1; index >= 0; --index) {
                        this.lastRow = index + 1 + this.headerRow + this.skipRows
                        if (tmpVals[index][0].trim()) break
                    }
                }

                if (options.dynamicTyping) {
                    this.values = this.Sheet.getRange(this.firstRow, 1, this.lastRow - (
                        this.headerRow + this.skipRows), this.lastCol)
                        .getValues()
                } else {
                    this.values = this.Sheet.getRange(this.firstRow, 1, this.lastRow - (
                        this.headerRow + this.skipRows), this.lastCol)
                        .getDisplayValues()
                }
                this.isEmpty = this.values[0].join('') === ''
                return this
            },

            /**
             * Transform values from 2D-array to array of objects
             * each row will be an object of values keyed by field name from
             * the header row instead of a simple array
             * @memberof sheetManager
             * @returns {sheetManager}
             */
            objectifyValues: function () {
                var self = this
                if (this.header.length === 0) {
                    throw new Error(
                        'Please use "parseSheet" method before you run "objectifyValues"')
                }

                function objectifyRows(row, rowIndex) {
                    function objectifyCells(prev, curr, index) {
                        prev[self.header[index]] = curr
                        return prev
                    }

                    var tmpObj = {}
                    Object.defineProperty(tmpObj, 'rowInSheet', {
                        value: rowIndex + self.firstRow,
                        writable: false,
                        enumerable: false,
                        configurable: false
                    })
                    return row.reduce(objectifyCells, tmpObj)
                }
                this.objectifiedValues = this.values.map(objectifyRows)
                return this
            },

            columnToArray: function (key) {
                var self = this
                if (typeof key !== "string" || !Array.isArray(key) || key.length === 0) {
                    throw new TypeError('"key" must be "string" or Array')
                }
                if (this.objectifiedValues.length === 0) {
                    throw new Error(
                        'Please use "objectifyValues" method before you run "columnToArray"'
                    )
                }
                function stringColumn(obj) {
                    return obj[key]
                }
                function arrayColumn(obj) {
                    key.forEach(function (k) {
                        if (self.header.indexOf(k) === -1) {
                            throw new Error('"' + k + '" could not be found in the header row')
                        }
                        if (self.column.hasOwnProperty(k)) {
                            self.column[k].push(obj[k])
                        } else {
                            self.column[k] = [obj[k]]
                        }
                    })
                }
                if (typeof key === "string") {
                    this.column = this.objectifiedValues.map(stringColumn)
                } else {
                    this.objectifiedValues.forEach(arrayColumn)
                }
                return this
            },

            /**
             * Transform array of objects to object of objects
             * from objects which share the same property-value (primaryKey) only the
             * last will be stored!
             * @memberof sheetManager
             * @param {string} [primaryKey] specify a header field to be used as a
             *        unique key identifier
             * @returns {sheetManager}
             */
            indexObjectifiedValues: function (primaryKey) {
                var self = this
                primaryKey = primaryKey || ''
                if (typeof primaryKey !== 'string') {
                    throw new TypeError('"primaryKey" must be "string"')
                }
                if (this.objectifiedValues.length === 0) {
                    throw new Error(
                        'Please use "objectifyValues" method before you run "indexObjectifiedValues"'
                    )
                }

                function objectifyAoO(obj) {
                    if (obj.hasOwnProperty(primaryKey)) {
                        self.indexedValues[obj[primaryKey]] = obj
                    }
                }
                if (primaryKey) {
                    if (this.header.indexOf(primaryKey) === -1) {
                        throw new Error('"' + primaryKey +
                            '" could not be found in the header row')
                    }
                    this.objectifiedValues.forEach(objectifyAoO)
                }
                return this
            },

            /**
             * @memberof sheetManager
             * @param {Array.<string>} desiredHeader array of strings representing the desired header
             * @returns {sheetManager}
             * @throws {Error} if the validation fails
             */
            validateHeader: function (desiredHeader) {
                if (!Array.isArray(desiredHeader)) {
                    throw new TypeError('"desiredHeader" must be "Array"')
                }

                if (this.header.length === 0) {
                    throw new Error(
                        'Please use "parseSheet" method before you run "validateHeader"')
                }

                for (var i = 0, len = desiredHeader.length; i < len; ++i) {
                    if (this.header.indexOf(desiredHeader[i]) === -1) {
                        throw new Error('Invalid header: A cell with "' + desiredHeader[i] +
                            '" was expected, but not found')
                    }
                }
                return this
            }
        }
        return sheetManager
    }

    /**
     * Utilities for string encoding/decoding, date formatting, JSON manipulation and other miscellaneous tasks
     * @typedef tools
     * @type {Object}
     */
    var tools = {

        /**
         * Find file in Google Drive
         * @memberof tools
         * @param {string} fileName name of the file
         * @param {Object} [Folder] [Google Apps Class]{@link https://developers.google.com/apps-script/reference/drive/folder}<br>limit file search to a specific folder instead of searching in the whole Google Drive
         * @param {boolean} [throwException=false] if set to true, throw error in case the file cannot be found
         * @returns {(Object|boolean)} [Google Apps Class]{@link https://developers.google.com/apps-script/reference/drive/file}
         */
        getFile: function (fileName, Folder, throwException) {
            var FileIterator
            if (Folder) {
                if (typeof Folder.removeFile !== 'function') {
                    throw new TypeError('"Folder" must be Google Apps class "Folder"')
                }
                FileIterator = Folder.getFilesByName(fileName)
            } else {
                FileIterator = DriveApp.getFilesByName(fileName)
            }
            if (!FileIterator.hasNext()) {
                if (throwException) {
                    throw new Error('Can\'t find "' + fileName + '" in Google Drive')
                } else {
                    return false
                }
            } else {
                return FileIterator.next()
            }
        },

        /**
         * Find folder in Google Drive
         * @memberof tools
         * @param {string} folderName name of the folder
         * @param {Object} [Folder] [Google Apps Class]{@link https://developers.google.com/apps-script/reference/drive/folder}<br>limit folder search to a specific root folder instead of searching in the whole Google Drive
         * @param {boolean} [throwException=false] if set to true, throw error in case the folder cannot be found
         * @returns {(Object|boolean)} [Google Apps Class]{@link https://developers.google.com/apps-script/reference/drive/folder}
         */
        getFolder: function (folderName, Folder, throwException) {
            var FolderIterator
            if (Folder) {
                if (typeof Folder.removeFile !== 'function') {
                    throw new TypeError('"Folder" must be Google Apps class "Folder"')
                }
                FolderIterator = Folder.getFoldersByName(folderName)
            } else {
                FolderIterator = DriveApp.getFoldersByName(folderName)
            }
            if (!FolderIterator.hasNext()) {
                if (throwException) {
                    throw new Error('Can\'t find "' + folderName + '" in Google Drive')
                } else {
                    return false
                }
            } else {
                return FolderIterator.next()
            }
        },

        /**
         * Alias to Utilities.formatDate with defaults
         * @memberof tools
         * @see [Utilities.formatDate]{@link https://developers.google.com/apps-script/reference/utilities/utilities#formatDate(Date,String,String)}
         * @param {string} [format=dd.MM.yyyy] a format per the [SimpleDateFormat specification]{@link http://docs.oracle.com/javase/7/docs/api/java/text/SimpleDateFormat.html}
         * @param {Date} [date=new Date()] a date to format as a string
         * @param {string} [timeZone=GMT+0200] the output timezone of the result
         * @returns {string} the input date as a formatted string
         */
        formatDate: function (format, date, timeZone) {
            format = format || 'dd.MM.yyyy'
            if (typeof format !== 'string') {
                throw new TypeError('"format" must be "string"')
            }
            date = date || new Date()
            if (Object.prototype.toString.call(date) !== '[object Date]') {
                throw new TypeError('"date" must be "Date"')
            }
            timeZone = timeZone || 'GMT+0200'
            if (typeof timeZone !== 'string') {
                throw new TypeError('"timeZone" must be "string"')
            }
            return Utilities.formatDate(date, timeZone, format)
        },

        /**
         * Get elapsed time since specific date
         * @memberof tools
         * @param {(Date|number)} start date or milliseconds since 01.01.1970 00:00:00 UTC to be used as start-time
         * @returns {number} elapsed time in seconds
         */
        measureTime: function (start) {
            if (Object.prototype.toString.call(start) === '[object Date]') { start = start.getTime() }
            if (typeof start !== 'number') {
                throw new TypeError('"start" must be "Date" or "number"')
            }
            return (Date.now() - start) / 1000
        },

        /**
         * Delete a given file in the Google Drive
         * @memberof tools
         * @param {Object} File [Google Apps Class]{@link https://developers.google.com/apps-script/reference/drive/file}<br>the file that should be deleted
         * @param {Object} Folder [Google Apps Class]{@link https://developers.google.com/apps-script/reference/drive/folder}<br>the folder in which that file can be found
         * @returns {undefined}
         */
        deleteFile: function deleteFile(File, Folder) {
            if (typeof File.setTrashed !== 'function') {
                throw new TypeError('"File" must be Google Apps class "File"')
            }
            if (typeof Folder.removeFile !== 'function') {
                throw new TypeError('"Folder" must be Google Apps class "Folder"')
            }
            if (File.getOwner()
                .getEmail() === Session.getEffectiveUser()
                    .getEmail()) {
                File.setTrashed(true)
            } else {
                Folder.removeFile(File)
            }
        }
    }

    imp.createSpreadsheetManager = createSpreadsheetManager
    imp.tools = tools
    return imp
}))
