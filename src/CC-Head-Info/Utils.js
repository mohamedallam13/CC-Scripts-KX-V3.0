; (function (root, factory) {
  root.Utils = factory()
})(this, function () {
  var Utils = {}

  function createTemplate(templateObj, template) {
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    var getTemp = _.template(template)
    var temp = getTemp(templateObj)
    return temp
  }

  function Request(payload) {
    this.url = "https://www.googleapis.com/upload/gmail/v1/users/me/messages/send?uploadType=multipart"
    this.headers = {
      "Authorization": "Bearer " + ScriptApp.getOAuthToken(),
      "Content-Type": "message/rfc822"
    }
    this.muteHttpExceptions = true
    this.payload = payload
    this.method = "post"
    this.contentType = "message/rfc822"
  }

  function createPdfBlob(temp) {
    var htmlOutput = HtmlService.createHtmlOutput(temp)
    var blob = htmlOutput.getAs(MimeType.PDF)
    return blob
  }

  function PayloadObj(fromName, fromEmail, replyTo, subject, toEmail, body, htmlBody, logo, pdfName, pdfBlob) {
    var encode = function (str) {
      var encStr = Utilities.base64Encode(str, Utilities.Charset.UTF_8);
      return '=?utf-8?B?' + encStr + '?='
    }
    this.from_name = encode(fromName)
    this.from_email = fromEmail
    this.reply_to = replyTo
    this.cc = replyTo
    this.subject = encode(subject)
    this.to_email = toEmail
    this.body = Utilities.base64Encode(body, Utilities.Charset.UTF_8)
    this.html_body = Utilities.base64Encode(htmlBody, Utilities.Charset.UTF_8)
    if (logo) { this.base64_logo = logo }
    if (pdfName) { this.file_name = pdfName }
    if (pdfBlob) {
      this.base64_pdf = _.attempt(function () { return Utilities.base64Encode(pdfBlob.getBytes()) })
      while (_.isError(this.base64_pdf)) {
        this.base64_pdf = _.attempt(function () { return Utilities.base64Encode(pdfBlob.getBytes()) })
      }
    }
  }

  function createPdf(blob, name, folder) {
    try {
      blob.setName(name);
      folder.createFile(blob)
    } catch (error) {
      console.log("pdf wasn't created")
      var count = 0
      var success = false
      while (count < 3 || success == false) {
        try {
          blob.setName(name);
          folder.createFile(blob)
          success = true
          console.log("pdf was created")
        } catch (error) {
          count++
          if (count = 3) { throw error }
        }
      }
    }
  }


  //source: https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript?page=1&tab=votes#tab-top
  function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();
    if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
      d += performance.now(); //use high-precision timer if available
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function writeData(data, startRow, startColumn, sheetName, ssId) {
    ss = ssId == undefined ? SpreadsheetApp.getActiveSpreadsheet() : SpreadsheetApp.openById(ssID)
    sheet = sheetName == undefined ? ss.getActiveSheet() : ss.getSheetByName(sheetName)
    sheet.getRange(startRow, startColumn, data.length, data[0].length).setValues(data)
  }

  function writeDataAdv(data, ranges, ssId, type, sheet) {
    type = type == undefined ? "RAW" : type
    ssId = ssId == undefined ? SpreadsheetApp.getActiveSpreadsheet().getId() : ssId
    if (!Array.isArray(ranges) && ranges != undefined) {
      var valueRange = Sheets.newValueRange()
      valueRange.values = data
      valueRange.range = ranges
      Sheets.Spreadsheets.Values.update(valueRange, ssId, ranges, { valueInputOption: type })
    } else if (ranges == undefined) {
      var valueRange = Sheets.newRowData()
      valueRange.values = data
      var appendRequest = Sheets.newAppendCellsRequest();
      appendRequest.sheetId = ssId;
      appendRequest.rows = [valueRange];
      Sheets.Spreadsheets.Values.append(valueRange, ssId, sheet, { valueInputOption: type });
    } else {
      requests = []
      ranges.forEach(function (range, idx) {
        var valueRange = Sheets.newValueRange()
        valueRange.range = range
        valueRange.values = data[idx]
        requests.push(valueRange)
      })
      var updateRequest = Sheets.newBatchUpdateValuesRequest()
      updateRequest.data = requests
      updateRequest.valueInputOption = type
      Sheets.Spreadsheets.Values.batchUpdate(updateRequest, ssId)
    }
  }

  function getSheetManager(ssId, sheetNames, parseOptions) {
    var ss = imp.createSpreadsheetManager(ssId)
    ss.addSheets(sheetNames)
    if (typeof sheetNames === "string") {
      parseOptions = parseOptions || {}
      ss.sheets[sheetNames].parseSheet(parseOptions).objectifyValues()
      return ss.sheets[sheetNames]
    } else {
      sheetNames.forEach(function (sheetName, idx) {
        parseOption = parseOption[idx] || {}
        ss.sheets[sheetName].parseSheet(parseOption).objectifyValues()
      })
      return ss
    }
  }

  function a1ToColNum(char) {
    var num = 0, len = char.length, pos = len;
    while (--pos > -1) {
      num += (char.charCodeAt(pos) - 64) * Math.pow(26, len - 1 - pos);
    }
    return num;
  }

  function colNumToA1(num) {
    for (var ret = '', a = 1, b = 26; (num -= a) >= 0; a = b, b *= 26) {
      ret = String.fromCharCode(parseInt((num % b) / a) + 65) + ret;
    }
    return ret;

  }

  function getFile(id) {
    var file = DriveApp.getFileById(id)
    return file
  }

  function getJSONData(idFile) {
    var file
    if (typeof idFile === "string") {
      file = getFile(idFile)
    } else if (Object.prototype.toString.call(idFile) === "[object Object]") {
      file = idFile
    }
    var data = JSON.parse(file.getBlob().getDataAsString())

    return data
  }

  function writeJSON(data, idFile) {
    if (typeof idFile === "string") {
      file = getFile(idFile)
    } else if (Object.prototype.toString.call(idFile) === "[object Object]") {
      file = idFile
    }
    file.setContent(JSON.stringify(data, null, 4))
  }

  function readCache(key) {
    return typeof key === "string" ? CacheService.getScriptCache().get(key) : JSON.parse(CacheService.getScriptCache().getAll(key))
  }

  function writeCache(obj, expiration) {
    expiration = expiration || 600
    CacheService.getScriptCache().putAll(obj, expiration)
  }

  function getFolder(id) {
    return DriveApp.getFolderById(id)
  }

  function deleteCache(key) {
    key = key.toString()
    CacheService.getScriptCache().remove(key)
  }

  function getInvNo(id, country) {
    if (country !== undefined) {
      return readCache("invoice_number") == null ? getJSONData(id)["invoice_number"][country]["invoice_number"] : parseInt(JSON.parse(readCache("invoice_number"))[country]["invoice_number"])
    } else {
      return readCache("invoice_number") == null ? getJSONData(id)["invoice_number"] : isNaN(parseInt(readCache("invoice_number"))) ? JSON.parse(readCache("invoice_number")) : parseInt(readCache("invoice_number"))
    }
  }



  function retrySending(count, caseArr) {
    var allErrors = []
    var allCases = _.chunk(caseArr, 30)
    allCases.forEach(function (caseObjs) {
      var cases = []
      var requests = []
      caseObjs.forEach(function (caseObj) {
        cases.push(_.cloneDeep(caseObj.caseData))
        requests.push(_.cloneDeep(caseObj.request))
      })
      var errors = sendEmails(cases, requests)
      allErrors.push(errors)
    })
    count--
    if (count <= 0) {
      allErrors.forEach(function (singleCase) {
        finalErrors.push(new ErrObj(
          singleCase.response.getResponseCode(),
          JSON.parse(singleCase.response.getContentText()).error.message,
          singleCase.caseData.merchant_id,
          singleCase.caseData.inv_no)
        )
      })
    } else {
      retrySending(count, allErrors)
    }
  }

  function numToAmount(num, currency, conversionRate) {
    currency = currency != undefined ? " " + currency : ""
    conversionRate = conversionRate || 1
    numeral.locale("de")
    return numeral(num * conversionRate).format("0,0.00") + currency
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

  Utils.createTemplate = createTemplate
  Utils.Request = Request
  Utils.createPdfBlob = createPdfBlob
  Utils.PayloadObj = PayloadObj
  Utils.createPdf = createPdf
  Utils.writeData = writeData
  Utils.writeDataAdv = writeDataAdv
  Utils.getSheetManager = getSheetManager
  Utils.a1ToColNum = a1ToColNum
  Utils.colNumToA1 = colNumToA1
  Utils.getFile = getFile
  Utils.getJSONData = getJSONData
  Utils.writeJSON = writeJSON
  Utils.readCache = readCache
  Utils.writeCache = writeCache
  Utils.getFolder = getFolder
  Utils.deleteCache = deleteCache
  Utils.getInvNo = getInvNo
  Utils.retrySending = retrySending
  Utils.generateUUID = generateUUID
  Utils.numToAmount = numToAmount
  Utils.createTemplateSimple = createTemplateSimple

  return Utils
})