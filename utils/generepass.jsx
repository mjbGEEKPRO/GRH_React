// ✅ GÉNÉRATION DE MOT DE PASSE SÉCURISÉ
export const generateSecurePassword = () => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const specialChars = "@$!%*#?&";
  let password = [
    getRandomChar(lowercase),
    getRandomChar(uppercase),
    getRandomChar(digits),
    getRandomChar(specialChars),
  ];
  const allChars = lowercase + uppercase + digits + specialChars;
  for (let i = 4; i < 12; i++) {
    password.push(getRandomChar(allChars));
  }
  shuffleArray(password);
  return password.join("");
};

const getRandomChar = (chars) => {
  return chars.charAt(Math.floor(Math.random() * chars.length));
};

const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};
