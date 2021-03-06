import _ from 'lodash';
import Promise from 'bluebird';
import Fs from 'fs';
import Path from 'path';
import Logger from 'winston';

const EmailTemplate = require('email-templates').EmailTemplate;

const templateDir = Path.join(__dirname, '..', 'views', 'mail-templates');

export default async function getMailTemplate(templateName, variables = {}) {
  const returnValue = {};

  if (templateName && !Fs.existsSync(Path.join(templateDir, templateName))) {
    throw new Error(`template : ${templateName} not found.`);
  }

  try {
    const template = new EmailTemplate(Path.join(templateDir, templateName));
    const render = Promise.promisify(template.render, {
      context: template,
      multiArgs: true
    });
    const resultList = await render(variables);

    const result = _.isArray(resultList) ? _.head(resultList) : resultList;
    Object.assign(returnValue, {
      html: result.html,
      text: result.text || result.html,
      subject: result.subject
    });

    return returnValue;
  } catch (err) {
    Logger.error('getMailTemplate failed :: ', err);
    throw err;
  }
}
