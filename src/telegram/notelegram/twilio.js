import Logger from '../../util/logger';
import { Twilio } from 'twilio';

if (process.env.TWILIO_SID == null || process.env.TWILIO_AUTH == null || process.env.TWILIO_NUMBER == null)
  throw 'Add TWILIO_SID, TWILIO_AUTH, and TWILIO_NUMBER to your environment, please.';

const twilio = new Twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
const twilioNumber = process.env.TWILIO_NUMBER;
const dailyMax = 30;
let numToday = 0;

export const sendSms = (to, body) => {
  Logger.verbose(`Sending message to ${to}.`);

  if (numToday++ < dailyMax) twilio
    .messages
    .create({ from: twilioNumber, to, body })
    .then(ret => Logger.info(JSON.stringify(ret)))
    .catch(ret => Logger.error(JSON.stringify(ret)));
}

export const inviteSms = (number, title, inviter) => {
  Logger.info(`Sending invitation to ${number}.`)
  const message = `${inviter} has invited you to join the ${title} group on Telegram! This will forward all messages from the chat to your phone. You can reply by texting back to me! Reply with what fruit you are bringing to open communication, or with DINGO to deny the invitation. Questions? t.me/svendog`
  if (numToday++ < dailyMax) twilio
    .messages
    .create({ from: twilioNumber, to: number, body: message, })
    .then(ret => Logger.info(JSON.stringify(ret)))
    .catch(ret => Logger.error(JSON.stringify(ret)));
}

export const usage = async () => {
  let testing = process.env.TESTING_COST || 0.00;
  let numbers = 0.00;
  let messages = 0.00;
  try {
    const sms = await twilio.usage.records.list({ category: 'sms' });
    const phonenumbers = await twilio.usage.records.list({ category: 'phonenumbers' });
    sms.forEach(record => { messages += record.price });
    phonenumbers.forEach(record => { numbers += record.price });
    return { testing, numbers, messages };
  } catch (error) {
    Logger.error(error);
    return null
  }
}