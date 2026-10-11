/**
 * Gera um nome de usuário com 6 letras (maiúsculas)
 */
export function generateUsername(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let username = '';
  for (let i = 0; i < 6; i++) {
    username += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return username;
}

/**
 * Gera uma senha com 6 caracteres misturando letras (maiúsculas e minúsculas) e números
 */
export function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Valida se o usuário segue o padrão de 6 letras
 */
export function validateUsername(username: string): boolean {
  return /^[A-Z]{6}$/.test(username);
}

/**
 * Valida se a senha segue o padrão de 6 caracteres mistos (letras e números)
 */
export function validatePassword(password: string): boolean {
  return /^[A-Za-z0-9]{6}$/.test(password);
}
