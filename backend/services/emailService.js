const nodemailer = require('nodemailer');
require('dotenv').config();

// 创建邮件传输器
let transporter;
try {
  transporter = nodemailer.createTransporter({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} catch (error) {
  console.error('邮件传输器创建失败:', error);
  console.warn('邮件功能将不可用');
  transporter = null;
}

// 发送验证码邮件
const sendVerificationCode = async (email, code) => {
  if (!transporter) {
    console.warn('邮件传输器未初始化，无法发送验证码邮件');
    return;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '【旦缘】验证码',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">旦缘 - 复旦大学学生恋爱匹配平台</h2>
        <p>您好！</p>
        <p>您的验证码是：<strong style="font-size: 18px; color: #003366;">${code}</strong></p>
        <p>验证码有效期为15分钟，请及时使用。</p>
        <p>如果您没有请求此验证码，请忽略此邮件。</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">此邮件由系统自动发送，请勿直接回复。</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('验证码邮件已发送');
  } catch (error) {
    console.error('发送验证码邮件失败:', error);
    // 不再抛出错误，避免影响整个服务
  }
};

// 发送匹配结果邮件
const sendMatchResult = async (email, matchEmail, matchScore) => {
  if (!transporter) {
    console.warn('邮件传输器未初始化，无法发送匹配结果邮件');
    return;
  }
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: '【旦缘】匹配结果通知',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #003366;">旦缘 - 匹配结果</h2>
        <p>您好！</p>
        <p>我们已经完成了新一轮的匹配，您有一位匹配对象：</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>匹配邮箱：</strong>${matchEmail}</p>
          <p><strong>匹配分数：</strong>${matchScore}%</p>
        </div>
        <p>您可以通过邮箱与对方联系，开始一段美好的缘分。</p>
        <p style="margin-top: 20px; font-size: 12px; color: #666;">此邮件由系统自动发送，请勿直接回复。</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('匹配结果邮件已发送');
  } catch (error) {
    console.error('发送匹配结果邮件失败:', error);
    // 不再抛出错误，避免影响整个服务
  }
};

module.exports = {
  sendVerificationCode,
  sendMatchResult
};