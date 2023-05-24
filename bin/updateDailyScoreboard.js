import updateDailyScoreboard from '../src/updateDailyScoreboard';

async function main() {
  await updateDailyScoreboard({ isLive: false, league: 'nba' });
  await updateDailyScoreboard({ isLive: false, league: 'wnba' });
}

main();
