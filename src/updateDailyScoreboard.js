import fetchDailyScoreboard from './utils/fetch/fetchDailyScoreboard';
import upload from './utils/aws/upload';

const updateDailyScoreboard = async function updateDailyScoreboard() {
  const scoreboard = await fetchDailyScoreboard();
  if (scoreboard) {
    const { gameDate } = scoreboard;
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
  }
  return scoreboard;
};

export default updateDailyScoreboard;
