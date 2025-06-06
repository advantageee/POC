#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const args = process.argv.slice(2);
const command = args[0];

function updateEnvFile(enableAuth) {
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add the NEXT_PUBLIC_ENABLE_AUTH line
  const authLine = `NEXT_PUBLIC_ENABLE_AUTH=${enableAuth}`;
  
  if (envContent.includes('NEXT_PUBLIC_ENABLE_AUTH=')) {
    envContent = envContent.replace(/NEXT_PUBLIC_ENABLE_AUTH=.*/g, authLine);
  } else {
    envContent += `\n${authLine}\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log(`✅ Authentication ${enableAuth === 'true' ? 'ENABLED' : 'DISABLED'}`);
  console.log('📝 Please restart the frontend server for changes to take effect');
}

switch (command) {
  case 'enable':
    updateEnvFile('true');
    break;
  case 'disable':
    updateEnvFile('false');
    break;
  case 'status':
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/NEXT_PUBLIC_ENABLE_AUTH=(.+)/);
      const authEnabled = match ? match[1] === 'true' : false;
      console.log(`🔒 Authentication: ${authEnabled ? 'ENABLED' : 'DISABLED'}`);
    } else {
      console.log('🔒 Authentication: DISABLED (no .env.local file)');
    }
    break;
  default:
    console.log('🛠️  Authentication Toggle Script');
    console.log('Usage:');
    console.log('  node auth-toggle.js enable   - Enable Azure AD B2C authentication');
    console.log('  node auth-toggle.js disable  - Disable authentication (development mode)');
    console.log('  node auth-toggle.js status   - Show current authentication status');
    break;
}
