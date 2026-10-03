const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Carregar .env
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  lines.forEach(line => {
    const lineTrimmed = line.trim();
    if (lineTrimmed && lineTrimmed.includes('=')) {
      const eqIndex = lineTrimmed.indexOf('=');
      const key = lineTrimmed.substring(0, eqIndex).trim();
      const value = lineTrimmed.substring(eqIndex + 1).trim();
      process.env[key] = value;
    }
  });
  console.log('✅ .env carregado');
  console.log('✅ DATABASE_URL configurada');
} else {
  console.error('❌ Arquivo .env não encontrado');
  process.exit(1);
}

// Iniciar Next.js
console.log('\n🚀 Iniciando servidor de desenvolvimento...\n');

const dev = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  shell: true
});

dev.on('error', (err) => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});

dev.on('close', (code) => {
  console.log(`\nServidor encerrado com código ${code}`);
});
