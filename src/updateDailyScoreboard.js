import fetchDailyScoreboard from './utils/fetch/fetchDailyScoreboard';
import upload from './utils/aws/upload';
import log from './utils/log';

const updateDailyScoreboard = async function updateDailyScoreboard() {
  const scoreboard = await fetchDailyScoreboard();
  if (scoreboard) {
    const { gameDate, games } = scoreboard;
    log(`Loaded scoreboard for ${gameDate} with ${games.length} games`);
    const content = JSON.stringify(scoreboard);
    await Promise.all([
      upload({
        key: 'stats/global/scoreboard.json',
        content,
      }),
      upload({
        key: `stats/global/daily-schedule/${gameDate}.json`,
        content,
      }),
    ]);
  } else {
    log('Failed to load scoreboard');
  }
  return scoreboard;
};

export default updateDailyScoreboard;
