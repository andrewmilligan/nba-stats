import updateDailyScoreboard from '../src/updateDailyScoreboard';
import updateGame from '../src/updateGame';

const main = async () => {
  const scoreboard = await updateDailyScoreboard();
  if (scoreboard) {
    await Promise.all(scoreboard.games.map(({ gameId }) => (
      updateGame(gameId)
    )));
  }

  // setTimeout(main, 6 * 1000);
};

main();
