import axios from "axios";
import dotenv from "dotenv";
import cron from "node-cron";

dotenv.config();

const API_URL = process.env.API_URL || "http://localhost:3000/api";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error("Error: ADMIN_TOKEN is not set in the environment variables.");
  process.exit(1);
}

const resetAllMMR = async () => {
  try {
    const modesResponse = await axios.get(`${API_URL}/game-modes`, {
      headers: {
        Authorization: `Bearer ${ADMIN_TOKEN}`,
      },
    });

    const gameModes = modesResponse.data;

    for (const mode of gameModes) {
      const modeId = mode.id;
      const baseMMR = 1000;

      try {
        const response = await axios.post(
          `${API_URL}/admin/mmr/season-reset?mode_id=${modeId}&base=${baseMMR}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${ADMIN_TOKEN}`,
            },
          },
        );

        console.log(
          `Réinitialisation réussie pour le mode ${modeId}:`,
          response.data,
        );
      } catch (error) {
        console.error(
          `Erreur lors de la réinitialisation pour le mode ${modeId}:`,
          error.response?.data || error.message,
        );
      }
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération des modes de jeu:",
      error.response?.data || error.message,
    );
  }
};

cron.schedule("0 0 1 * *", async () => {
  console.log("Début de la réinitialisation mensuelle des MMR...");
  await resetAllMMR();
  console.log("Réinitialisation mensuelle terminée.");
});

console.log("Tâche planifiée pour réinitialiser les MMR tous les mois.");
