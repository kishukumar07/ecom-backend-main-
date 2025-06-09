import nodemailer from 'nodemailer';
import { generateOtpEmailTemplate } from './otpTemplate.js';
import generateOrderConfirmationEmail from './orderPlacedTemplate.js';
import generateOrderShippedEmail from './orderShipedTemplate.js';
import generateOrderDeliveredEmail from './orderDelivered.js';
import generateOrderCancelledEmail from './orderCancelled.js';

export const sendEmail=async({email,emailType,val})=>{
  try {
    const transport = nodemailer.createTransport({
      service: process.env.EMAIL_PROVIDER,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD
      }
    });
    let templateMsg;
    let sub;
    if(emailType=='OTP'){
      templateMsg=generateOtpEmailTemplate(val);
      sub='Verify Your Account';
    }else if(emailType=='ORDER_PLACED'){
      templateMsg=generateOrderConfirmationEmail(val);
      sub='Order Confirmation';
    }else if(emailType=='ORDER_SHIPPED'){
      templateMsg=generateOrderShippedEmail(val);
      sub='Order Shipped'
    }else if(emailType=='ORDER_DELIVERED'){
      templateMsg=generateOrderDeliveredEmail(val);
      sub='Order Devlivered'
    }else if(emailType=='ORDER_CANCELLED'){
      templateMsg=generateOrderCancelledEmail(val);
      sub='Order Cancelled';
    }
    const info = await transport.sendMail({
      from:process.env.EMAIL_USER,
      to: email,
      subject: sub,
      html:templateMsg
    });
    return info;
  } catch (error) {
    console.error("Error sending mail : ", error);
    return;
  }
}