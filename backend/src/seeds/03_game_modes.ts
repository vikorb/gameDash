import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("game_modes").del();
  
	await knex("game_modes").insert([
		{ id: 1, name: "Classé", is_active: true, description: "Mode compétitif avec classement." },
		{ id: 2, name: "Non classé", is_active: true, description: "Mode détente sans classement." },
		{ id: 3, name: "Fun", is_active: true, description: "Mode fun avec règles spéciales." }
	]);
}
