import nodemailer, { Transporter } from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import Mail from 'nodemailer/lib/mailer';

class SendMailService {
  private client: Promise<Transporter> | Mail;

  constructor() {
    this.client = new Promise((resolve) => {
      nodemailer.createTestAccount().then((account) => {
        const transporter = nodemailer.createTransport({
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass,
          },
        });

        resolve(transporter);
      });
    });
  }

  async execute(to: string, subject: string, variables: object, path: string) {
    const template = fs.readFileSync(path).toString('utf8');

    const templateBuilder = handlebars.compile(template);
    const html = templateBuilder(variables);

    this.client = await this.client;

    const message = await this.client.sendMail({
      to,
      subject,
      html,
      from: 'NPS <noreply@npser.com>',
    });

    console.log('Message sent %s', message.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(message));
  }
}

export default SendMailService;
