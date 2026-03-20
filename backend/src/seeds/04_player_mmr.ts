import type { Knex } from "knex";

type UserRow = { id: number };
type ModeRow = { id: number };

export async function seed(knex: Knex): Promise<void> {
    await knex("player_mmr").del();

    const users: UserRow[] = await knex("users").select("id");
    const modes: ModeRow[] = await knex("game_mode").where({ is_active: true }).select("id");

    const mmrEntries = [];
    for (const user of users) {
        for (const mode of modes) {
            mmrEntries.push({ user_id: user.id, mode_id: mode.id, mmr: 1000 });
        }
    }

    if (mmrEntries.length > 0) {
        await knex("player_mmr").insert(mmrEntries);
    }
}