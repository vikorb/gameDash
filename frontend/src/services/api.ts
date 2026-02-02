export const checkHealth = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/health`);
  return response.json();
};
