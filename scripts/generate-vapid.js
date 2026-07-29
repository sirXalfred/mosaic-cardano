import webPush from 'web-push';

console.log('\n==========================================');
console.log('🔑 Generating VAPID Key Pair for Web Push');
console.log('==========================================\n');

const vapidKeys = webPush.generateVAPIDKeys();

console.log('Copy and paste the following into your .env or .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log(`VAPID_SUBJECT=mailto:admin@mosaic.app\n`);
console.log('==========================================\n');
