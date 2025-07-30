import dotenv from 'dotenv';

console.log('Testing dotenv...');

const result = dotenv.config();
console.log('Dotenv result:', result);

console.log('Environment variables:');
console.log('PACKAGE_ID:', process.env.PACKAGE_ID);
console.log('PROCESSOR_OBJECT_ID:', process.env.PROCESSOR_OBJECT_ID);
console.log('ADMIN_ADDRESS:', process.env.ADMIN_ADDRESS);
