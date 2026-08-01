import 'dotenv/config';

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name} (see .env.example)`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  publicBaseUrl: required('PUBLIC_BASE_URL').replace(/\/$/, ''),
  adminToken: required('ADMIN_TOKEN'),
  databasePath: process.env.DATABASE_PATH ?? './focus-gateway.db',
  twilio: {
    accountSid: required('TWILIO_ACCOUNT_SID'),
    authToken: required('TWILIO_AUTH_TOKEN'),
    validateSignatures: process.env.VALIDATE_TWILIO_SIGNATURES !== 'false',
  },
};
