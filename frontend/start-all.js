const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure the server .env file exists, creating from example if it doesn't
const serverEnvPath = path.join(__dirname, 'server', '.env');
const serverEnvExamplePath = path.join(__dirname, 'server', '.env.example');

if (!fs.existsSync(serverEnvPath) && fs.existsSync(serverEnvExamplePath)) {
  console.log('Creating server .env file from example...');
  fs.copyFileSync(serverEnvExamplePath, serverEnvPath);
}

// Ensure the frontend .env.local file exists, creating from example if it doesn't
const frontendEnvPath = path.join(__dirname, '.env.local');
const frontendEnvExamplePath = path.join(__dirname, '.env.local.example');

if (!fs.existsSync(frontendEnvPath) && fs.existsSync(frontendEnvExamplePath)) {
  console.log('Creating frontend .env.local file from example...');
  fs.copyFileSync(frontendEnvExamplePath, frontendEnvPath);
}

// Function to start a process and handle its output
function startProcess(command, args, name, cwd) {
  const proc = spawn(command, args, {
    cwd: cwd || __dirname,
    shell: true,
    stdio: 'pipe'
  });
  
  // Add prefix to each line of output
  const prefix = `[${name}] `;
  
  proc.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(prefix + line);
    });
  });
  
  proc.stderr.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(`${prefix}ERROR: ${line}`);
    });
  });
  
  proc.on('close', (code) => {
    console.log(`${prefix}Process exited with code ${code}`);
  });
  
  return proc;
}

// Start the Next.js frontend
const frontendProcess = startProcess('npm', ['run', 'dev'], 'FRONTEND');

// Start the scraper service
const serverProcess = startProcess('npm', ['run', 'dev'], 'SCRAPER', path.join(__dirname, 'server'));

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nShutting down all processes...');
  
  // Kill child processes
  frontendProcess.kill();
  serverProcess.kill();
  
  // Exit after a short delay to allow cleanup
  setTimeout(() => {
    process.exit(0);
  }, 500);
});

console.log('All services started. Press Ctrl+C to stop all processes.'); 