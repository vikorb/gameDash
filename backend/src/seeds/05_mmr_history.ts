import type { Knex } from "knex";

type UserRow = { id: number };
type ModeRow = { id: number };

export async function seed(knex: Knex): Promise<void> {
    await knex("mmr_history").del();

    const users: UserRow[] = await knex("users").select("id");
    const modes: ModeRow[] = await knex("game_mode").where({ is_active: true }).select("id");

    const historyEntries = [];
    for (const user of users) {
        for (const mode of modes) {
            for (let i = 0; i < 5; i++) {
                historyEntries.push({
                    user_id: user.id,
                    mode_id: mode.id,
                    mmr: 1000 + i * 10,
                    date: new Date(Date.now() - (5 - i) * 86400000),
                });
            }
        }
    }

    if (historyEntries.length > 0) {
        await knex("mmr_history").insert(historyEntries);
    }
}
