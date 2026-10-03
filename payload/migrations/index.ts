import * as migration_20260925_134536_initial_schema from './20260925_134536_initial_schema';
import * as migration_20261003_124000_news_events from './20261003_124000_news_events';

export const migrations = [
  {
    up: migration_20260925_134536_initial_schema.up,
    down: migration_20260925_134536_initial_schema.down,
    name: '20260925_134536_initial_schema'
  },
  {
    up: migration_20261003_124000_news_events.up,
    down: migration_20261003_124000_news_events.down,
    name: '20261003_124000_news_events'
  },
];
