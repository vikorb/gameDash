import db from '../database';

export async function isDemoModeActive(): Promise<boolean> {
  const row = await db('app_settings').where({ key: 'demo_mode' }).first();
  return row ? row.value === 'true' : false;
}

export async function setDemoModeActive(value: boolean): Promise<void> {
  await db('app_settings')
    .insert({ key: 'demo_mode', value: String(value) })
    .onConflict('key')
    .merge();
}
