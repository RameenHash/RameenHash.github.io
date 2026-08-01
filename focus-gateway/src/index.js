import express from 'express';
import { config } from './config.js';
import { voiceRouter } from './routes/voice.js';
import { smsRouter } from './routes/sms.js';
import { adminRouter } from './routes/admin.js';
import { startReleaseJob } from './release.js';

const app = express();

// Twilio posts webhooks as form-encoded; admin API is JSON.
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use(voiceRouter);
app.use(smsRouter);
app.use('/admin', adminRouter);

app.listen(config.port, () => {
  console.log(`focus-gateway listening on :${config.port}`);
  console.log(`public base URL: ${config.publicBaseUrl}`);
  startReleaseJob();
});
