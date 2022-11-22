/* eslint-disable import/prefer-default-export */
import fetchDailyScoreboard from './utils/fetch/fetchDailyScoreboard';
import queueMessages from './utils/aws/queueMessages';

export const scheduleTasks = async function scheduleTasks() {
  const scoreboard = await fetchDailyScoreboard();
  if (!scoreboard) return;

  // Games that are live or starting soon
  const tenMinutes = 10 * 60 * 1000;
  const now = new Date();
  const games = scoreboard.games
    .filter(({ gameStatus, gameDateTime }) => {
      if (gameStatus === 2) return true;
      const startTime = new Date(gameDateTime);
      return startTime > now && (startTime - now) < tenMinutes;
    })
    .sort((a, b) => a.gameDateTime.localeCompare(b.gameDateTime));

  // Bail if there are no games to schedule
  if (games.length < 1) {
    return;
  }

  const messageBodies = [
    {
      task: 'update-daily-scorebaard',
    },
    ...games.map((game) => ({
      task: 'update-game',
      gameId: game.gameId,
    })),
  ];

  // Update every 10 seconds over the next 10 minutes
  const numUpdates = (10 * 60) / 10;
  const batches = [...Array(numUpdates)].map((_, i) => (
    messageBodies.map((body) => ({
      delay: 10 * i,
      body,
    }))
  ));

  await queueMessages({
    messages: batches.flat(),
  });
};
