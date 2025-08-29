const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');

let transporter;
const createTransporter = async () => {
  if (transporter) return transporter; 

  if (process.env.NODE_ENV === 'production') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
      },
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`Ethereal test account: ${testAccount.user} / ${testAccount.pass}`);
  }
  return transporter;
};


const templateCache = new Map();

const getCompiledTemplate = async (templateName) => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }
  const templatePath = path.join(__dirname, '../templates/emails', `${templateName}.hbs`);
  const templateSource = await fs.readFile(templatePath, 'utf8');
  const compiledTemplate = handlebars.compile(templateSource);
  templateCache.set(templateName, compiledTemplate);
  return compiledTemplate;
};

const sendEmail = async (options) => {
  try {
    const transporterInstance = await createTransporter();

    let htmlContent = '';
    if (options.template) {
      const compiledTemplate = await getCompiledTemplate(options.template);
      htmlContent = compiledTemplate(options.context || {});
    }

    const mailOptions = {
      from: {
        name: process.env.EMAIL_FROM_NAME || 'I-GYAN.AI',
        address: process.env.EMAIL_FROM || process.env.EMAIL_USER
      },
      to: options.to,
      subject: options.subject,
      html: htmlContent || options.html,
      text: options.text,
      attachments: options.attachments
    };

    const info = await transporterInstance.sendMail(mailOptions);

    if (process.env.NODE_ENV !== 'production') {
      console.log('Email sent:', info.messageId);
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV !== 'production' ? nodemailer.getTestMessageUrl(info) : null
    };
  } catch (error) {
    if (error.response && error.response.includes('rate limited')) {
      console.warn('Rate limited — retrying in 30s...');
      await new Promise(res => setTimeout(res, 30000));
      return sendEmail(options);
    }
    console.error('Error sending email:', error);
    throw error;
  }
};

const sendWelcomeEmail = async (userEmail, userName) => {
  return sendEmail({
    to: userEmail,
    subject: 'Welcome to I-GYAN.AI! 🎉',
    template: 'welcome',
    context: {
      name: userName,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@i-gyan.ai'
    }
  });
};

const sendPasswordChangedNotification = async (userEmail, userName) => {
  return sendEmail({
    to: userEmail,
    subject: 'Password Changed - I-GYAN.AI',
    template: 'passwordChanged',
    context: {
      name: userName,
      changeTime: new Date().toLocaleString(),
      supportEmail: process.env.SUPPORT_EMAIL || 'support@i-gyan.ai'
    }
  });
};

const sendEmailVerificationReminder = async (userEmail, userName, verificationUrl) => {
  return sendEmail({
    to: userEmail,
    subject: 'Please Verify Your Email - I-GYAN.AI',
    template: 'emailVerification',
    context: {
      name: userName,
      verificationUrl,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@i-gyan.ai'
    }
  });
};

const sendAccountDeactivationNotification = async (userEmail, userName) => {
  return sendEmail({
    to: userEmail,
    subject: 'Account Deactivated - I-GYAN.AI',
    template: 'accountDeactivated',
    context: {
      name: userName,
      reactivateUrl: `${process.env.FRONTEND_URL}/reactivate`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@i-gyan.ai'
    }
  });
};

handlebars.registerHelper('currentYear', () => {
  return new Date().getFullYear();
});

handlebars.registerHelper('formatDate', (date) => {
  return new Date(date).toLocaleDateString();
});

handlebars.registerHelper('eq', (a, b) => {
  return a === b;
});

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordChangedNotification,
  sendEmailVerificationReminder,
  sendAccountDeactivationNotification
};