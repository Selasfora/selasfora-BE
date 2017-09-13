import _ from 'lodash';
import Logger from 'winston';
import nodemailer from 'nodemailer';
import Config from '../../config';
import getMailTemplate from './mailTemplateHelper';

class Mailer {
  constructor() {
    try {
      const transport = Config.get('mailer').get('transport');
      const transportOptions = Config.get('mailer').get(transport).toJS();
      if (!_.isObject(transportOptions)) {
        throw new Error('No valid mailer transport found');
      }
      // eslint-disable-next-line global-require,import/no-dynamic-require
      require(transportOptions.package);
      transportOptions.transport = transport;
      this.transport = nodemailer.createTransport(transportOptions);
    } catch (err) {
      Logger.error('Either Mail Config is incorrect or dependent package could not be loaded');
      // FAIL FAST IF PACKAGE IS NOT FOUND.
      process.exit(1);
    }
  }

  // eslint-disable-next-line  class-methods-use-this
  async dispatchMail(templateName, from, to, variableOpts = {}) {
    try {
      const variables = _.cloneDeep(variableOpts);

      Logger.info(' variables:: ', variables);
      const template = await getMailTemplate(templateName, variables);

      Logger.info('resulted template object :: ', template);
      Logger.info('resulted from', (from));
      Logger.info('resulted to', (to));

      const sesMessage = {
        from,
        to,
        subject: template.subject,
        text: template.text,
        html: template.html
      };

      const response = await this.transport.sendMail(sesMessage);
      return response;
    } catch (err) {
      Logger.error('Mailer.dispatchMail :: error :: ', err);
      // throw err;
    }
    return false;
  }
}

export default new Mailer();
