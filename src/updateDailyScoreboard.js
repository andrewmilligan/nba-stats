import fetchDailyScoreboard from './utils/fetch/fetchDailyScoreboard';
import upload from './utils/aws/upload';
import log from './utils/log';
import cacheControl from './utils/cache/cacheControl';
import { TEN_MINUTES, FIVE_MINUTES, TEN_SECONDS } from './utils/cache/ages';

const updateDailyScoreboard = async function updateDailyScoreboard(opts = {}) {
  const {
    isLive = false,
  } = opts;

  const scheduleCacheControl = cacheControl(TEN_MINUTES);
  const scoreboardCacheControl = isLive
    ? cacheControl(TEN_SECONDS)
    : cacheControl(FIVE_MINUTES);

  const scoreboard = await fetchDailyScoreboard();
  if (scoreboard) {
    const { gameDate, games } = scoreboard;
    log(`Loaded scoreboard for ${gameDate} with ${games.length} games`);
    const content = JSON.stringify(scoreboard);
    await Promise.all([
      upload({
        key: 'stats/global/scoreboard.json',
        content,
        cacheControl: scoreboardCacheControl,
      }),
      upload({
        key: `stats/global/daily-schedule/${gameDate}.json`,
        content,
        cacheControl: scheduleCacheControl,
      }),
    ]);
  } else {
    log('Failed to load scoreboard');
  }
  return scoreboard;
};

export default updateDailyScoreboard;
