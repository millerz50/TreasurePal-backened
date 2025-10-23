export const generateAgentId = (): string => {
  const prefix = "AG";
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  const numericPart = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomPart}-${numericPart}`;
};
