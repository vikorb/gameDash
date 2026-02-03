import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("maps").insert([
    { 
      id: 1, 
      title: "Canyon de la Mort", 
      description: "Une map désertique très dangereuse.", 
      creator_id: 1,
      status: 'stable' 
    },
    { 
      id: 2, 
      title: "Forêt Interdite", 
      description: "Beaucoup d'arbres et peu de visibilité.", 
      creator_id: 1,
      status: 'beta' 
    }
  ])
  .onConflict('id')
  .merge();
}