; (function (root, factory) {
  root.EMAILING = factory()
})(this, function () {

  var EMAILING = {};

  const TEST_EMAIL = "mh.allam@yahoo.com";
  const LIVE = true;

  function createEmail(variables) {
    fillInTemplates(variables);
    var emailOptions = new EmailOptions(variables);
    sendEmail(emailOptions);
  }

  function fillInTemplates(variables) {
    variables.body = Utils.createTemplateSimple(variables.emailBodyTemplate, variables);
    variables.subject = Utils.createTemplateSimple(variables.subject_template, variables);
  }

  function EmailOptions(variables) {
    this.to = LIVE ? variables.emailRecipients : TEST_EMAIL;
    //this.cc = LIVE ? variables.cc : '';
    //this.bcc = LIVE ? variables.bcc : '';
    //this.replyTo = LIVE ? variables.defined_mail_account : '';
    this.name = 'Cairo Confessions Head'
    this.subject = variables.subject;
    this.body = variables.body;
    //this.htmlBody = variables.htmlBody;
    if (variables.attachment) {
      this.attachments = [variables.attachment];
    }
  }

  function sendEmail(emailOptions) {
    /* parameters
    attachments  - BlobSource[] - an array of files to send with the email
    bcc          - String       - a comma-separated list of email addresses to BCC
    body         - String       - the body of the email
    cc           - String       - a comma-separated list of email addresses to CC
    htmlBody     - String       - if set, devices capable of rendering HTML will use it instead of the required body argument; you can add an optional inlineImages field in HTML body if you have inlined images for your email
    inlineImages - Object       - a JavaScript object containing a mapping from image key (String) to image data (BlobSource); this assumes that the htmlBody parameter is used and contains references to these images in the format <img src="cid:imageKey" /> (see example)
    name         - String       - the name of the sender of the email (default: the user's name)
    noReply      - Boolean      - true if the email should be sent from a generic no-reply email address to discourage recipients from responding to emails; this option is only possible for Google Apps accounts, not Gmail users
    replyTo      - String       - an email address to use as the default reply-to address (default: the user's email address)
    subject      - String       - the subject of the email
    to           - String       - the address of the recipient
    */
    var rdq = getRemainingDailyQuota();
    if (rdq < 1) {
      throw 'Remaining e-mail quota exceeded. Please send e-mail manually.';
    } else {
      try {
        MailApp.sendEmail(emailOptions)
      } catch (e) {
        Logger.log(e)
        return e
      };
    }
  }

  function getRemainingDailyQuota() {
    var rdq = MailApp.getRemainingDailyQuota();
    return rdq;
  }

  EMAILING.createEmail = createEmail;
  return EMAILING
})