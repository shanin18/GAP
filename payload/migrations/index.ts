import * as migration_20260925_134536_initial_schema from './20260925_134536_initial_schema';
import * as migration_20261003_124000_news_events from './20261003_124000_news_events';
import * as migration_20261029_120000_payload_3_91 from './20261029_120000_payload_3_91';
import * as migration_20261029_130000_simpler_pipeline from './20261029_130000_simpler_pipeline';
import * as migration_20261030_120000_remove_apply_page from './20261030_120000_remove_apply_page';

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
  {
    up: migration_20261029_120000_payload_3_91.up,
    down: migration_20261029_120000_payload_3_91.down,
    name: '20261029_120000_payload_3_91'
  },
  {
    up: migration_20261029_130000_simpler_pipeline.up,
    down: migration_20261029_130000_simpler_pipeline.down,
    name: '20261029_130000_simpler_pipeline'
  },
  {
    up: migration_20261030_120000_remove_apply_page.up,
    down: migration_20261030_120000_remove_apply_page.down,
    name: '20261030_120000_remove_apply_page'
  },
];
