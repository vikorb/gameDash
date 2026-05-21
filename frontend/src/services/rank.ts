export async function getUserRank(userId: number) {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/rank`)
  if (!response.ok) throw new Error('Impossible de récupérer le rang')
  return await response.json()
}
