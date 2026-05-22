import updateDailyScoreboard from '../src/updateDailyScoreboard.js';

async function main() {
  await updateDailyScoreboard({ isLive: false, league: 'nba' });
  await updateDailyScoreboard({ isLive: false, league: 'wnba' });
}

main();
