; (function (root, factory) {
    root.Toolkit = factory()
})(this, function () {

    var Toolkit = {};

    function readFromJSON(fileId) {
        var file
        if (typeof fileId === "string") {
            file = DriveApp.getFileById(fileId);
        } else if (Object.prototype.toString.call(fileId) === "[object Object]") {
            file = fileId
        }
        var data = JSON.parse(file.getBlob().getDataAsString())
        return data
    }

    function writeToJSON(data, fileId) {
        var file
        if (typeof fileId === "string") {
            file = DriveApp.getFileById(fileId);
        } else if (Object.prototype.toString.call(fileId) === "[object Object]") {
            file = fileId
        }
        file.setContent(JSON.stringify(data, null, 4))
    }

    function createJSON(filename, folderId, content) {
        var file = DriveApp.createFile(filename, JSON.stringify(content, null, 4), MimeType.PLAIN_TEXT);
        DriveApp.getFolderById(folderId).addFile(file);
        file.getParents().next().removeFile(file);
        var fileId = file.getId();
        return fileId
    }

    function similarity(s1, s2) {
        var longer = s1;
        var shorter = s2;
        if (s1.length < s2.length) {
            longer = s2;
            shorter = s1;
        }
        var longerLength = longer.length;
        if (longerLength == 0) {
            return 1.0;
        }
        return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
    }
    function editDistance(s1, s2) {
        s1 = s1.toLowerCase();
        s2 = s2.toLowerCase();

        var costs = new Array();
        for (var i = 0; i <= s1.length; i++) {
            var lastValue = i;
            for (var j = 0; j <= s2.length; j++) {
                if (i == 0)
                    costs[j] = j;
                else {
                    if (j > 0) {
                        var newValue = costs[j - 1];
                        if (s1.charAt(i - 1) != s2.charAt(j - 1))
                            newValue = Math.min(Math.min(newValue, lastValue),
                                costs[j]) + 1;
                        costs[j - 1] = lastValue;
                        lastValue = newValue;
                    }
                }
            }
            if (i > 0)
                costs[s2.length] = lastValue;
        }
        return costs[s2.length];
    }

    function numToChar(num) {
        for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
            ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
        }
        return ret;
    }

    function arrayEquals(a, b) {
        return Array.isArray(a) &&
            Array.isArray(b) &&
            a.length === b.length &&
            a.every((val, index) => val === b[index]);
    }

    function createTemplateSimple(text, variables) {
        var variablesKeys = Object.keys(variables);
        variablesKeys.forEach(function (variable) {
            var replacement = variables[variable];
            var regex = new RegExp("{{ " + variable + " }}", "g");
            text = text.replace(regex, replacement)
        })
        return text;
    }

    function dateValueString(d) {
        var date = d ? new Date(d) : new Date();
        return date.valueOf().toString();
    }

    function timestampCreate(date, format) {
        var dt
        if (format) {
            if (date) {
                dt = Utilities.formatDate(new Date(date), "GMT+2:00", format)
            } else {
                dt = Utilities.formatDate(new Date(), "GMT+2:00", format);
            }
        } else {
            if (date) {
                dt = new Date(date);
            } else {
                dt = new Date();
            }
        }
        return dt;
    }

    function toTitleCase(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
            }
        );
    }

    function refitProperMobileNumber(mobile) {
        if (mobile) {
            mobile = mobile.replace(/^[\s+$]/g, '').replace(/-/g, '').toString();
            console.log(mobile)
            var pattern = /^!*(\d!*){10,}$/;
            if (mobile.match(pattern)) {
                if (mobile.length < 10) {
                    return 'invalid_mobile[' + mobile + ']';
                }
                if (mobile[0] == '+' && mobile.length >= 12) {
                    return mobile;
                }
                if (mobile[0] == '1' && mobile.length >= 10) {
                    return mobile = '+20' + mobile;
                }
                if (mobile[0] == '2' && mobile.length >= 12) {
                    return mobile = '+' + mobile;
                }
                if (mobile[0] == '0' && mobile.length >= 11) {
                    return mobile = '+2' + mobile;
                }
            }
            return 'invalid_mobile[' + mobile + ']';
        }
    }

    function transpose(matrix) {
        return matrix[0].map((col, i) => matrix.map(row => row[i]));
    }

    function writeToSheet(writeArr, ssid, sheetName, startRow, startCol) {
        var sheet = SpreadsheetApp.openById(ssid).getSheetByName(sheetName);
        var range = sheet.getRange(startRow, startCol, writeArr.length, writeArr[0].length);
        var a1 = range.getA1Notation();
        range.setValues(writeArr);
    }
    function createTemplateSimple(text, variables) {
        var variablesKeys = Object.keys(variables);
        variablesKeys.forEach(function (variable) {
            var replacement = variables[variable];
            var regex = new RegExp("<" + variable + ">", "g");
            text = text.replace(regex, replacement)
        })
        return text;
    }
    Toolkit.createTemplateSimple = createTemplateSimple;
    Toolkit.readFromJSON = readFromJSON;
    Toolkit.writeToJSON = writeToJSON;
    Toolkit.createJSON = createJSON;
    Toolkit.similarity = similarity;
    Toolkit.numToChar = numToChar;
    Toolkit.arrayEquals = arrayEquals;
    Toolkit.createTemplateSimple = createTemplateSimple;
    Toolkit.dateValueString = dateValueString;
    Toolkit.timestampCreate = timestampCreate;
    Toolkit.toTitleCase = toTitleCase;
    Toolkit.refitProperMobileNumber = refitProperMobileNumber;
    Toolkit.transpose = transpose;
    Toolkit.writeToSheet = writeToSheet;

    return Toolkit;

})