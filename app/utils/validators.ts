export const maskCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/[^\d]+/g, '');
  if (cleanCPF.length !== 11 || !!cleanCPF.match(/(\d)\1{10}/)) return false;

  const calculateDigit = (n: number) => {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
      sum += parseInt(cleanCPF.substring(i - 1, i)) * (n + 2 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleanCPF.substring(n, n + 1));
  };

  return calculateDigit(9) && calculateDigit(10);
};

export const maskDate = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{4})\d+?$/, '$1');
};

export const validateDate = (dateString: string): boolean => {
  if (dateString.length !== 10) return false;
  
  const [day, month, year] = dateString.split('/').map(Number);
  const currentYear = new Date().getFullYear();
  
  if (year < 1900 || year > currentYear) return false;

  const date = new Date(year, month - 1, day);
  return date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year;
};

export const checkPasswordStrength = (password: string) => {
  let score = 0;
  if (!password) return { score: 0, label: '', color: 'transparent' };

  if (/[a-z]/.test(password)) score += 1; // Letra minúscula
  if (/[A-Z]/.test(password)) score += 1; // Letra maiúscula
  if (/[0-9]/.test(password)) score += 1; // Número
  if (/[^A-Za-z0-9]/.test(password)) score += 1; // Símbolo especial
  if (password.length >= 8) score += 1; // Tamanho mínimo

  switch (true) {
    case score <= 2:
      return { score, label: 'Fraca', color: '#EF4444' };
    case score === 3 || score === 4:
      return { score, label: 'Média', color: '#F59E0B' };
    case score === 5:
      return { score, label: 'Forte', color: '#10B981' };
    default:
      return { score: 0, label: '', color: 'transparent' };
  }
};