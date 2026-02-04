import { MapRow } from './map';

declare module 'knex/types/tables' {
  interface Tables {
    maps: MapRow;
  }
}