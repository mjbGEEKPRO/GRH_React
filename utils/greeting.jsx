export const getGreeting = () => {
  const now = new Date();
  const hour = now.getHours();

  let greeting = "Bonjour";
  if (hour >= 12 && hour < 18) {
    greeting = "Bon après-midi";
  } else if (hour >= 18 || hour < 6) {
    greeting = "Bonsoir";
  }

  return greeting;
};
