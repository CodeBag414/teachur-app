var Promise = require('bluebird');
var _ = require('lodash');
var mandrill = require('mandrill-api/mandrill');
var mandrillClient = new mandrill.Mandrill('3NC40x27RO044m2uHeyK9Q');

function sendTemplate(recipient, templateName, data) {
    return new Promise(function(resolve, reject) {
        var message = generateMsg(recipient, null, null, data);

        mandrillClient.messages.sendTemplate({
            template_name: templateName,
            template_content: [],
            message: message,
            async: true
        }, function(response) {
            console.log('Sent mail', templateName, 'to', recipient);
            resolve(response)
        }, function(err) {
            console.log('Sending mail FAILED', err);
            reject(err)
        })
    });
}

function generateMsg(recipient, subject, html, data) {
    var msg = {
        from_email: 'info@teachur.co',
        from_name: 'Teachur',
        to: [{
            email: recipient,
            type: 'to'
        }],
        important: false,
        merge: true,
        merge_language: 'handlebars',
        global_merge_vars: convertData(data)
    };

    if (subject) msg.subject = subject;
    if (html) msg.html = html;

    console.log(msg);

    return msg;
}

function convertData(data) {
    var cData = _.map(data, function(v, k) {
        return {
            name: k,
            content: v
        }
    })

    cData.push({name: 'global_url', content: process.env.URL || 'http://localhost:8080'});

    return cData;

}

module.exports = {
    sendTemplate: sendTemplate
};