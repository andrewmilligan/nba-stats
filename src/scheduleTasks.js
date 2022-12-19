/* eslint-disable import/prefer-default-export */
import crypto from './utils/crypto';
import updateDailyScoreboard from './updateDailyScoreboard';
import queueMessages from './utils/aws/queueMessages';
import log from './utils/log';
import {
  UPDATE_DAILY_SCOREBOARD,
  UPDATE_GAME,
} from './utils/tasks/types';

const {
  SCHEDULE_RATE_MINUTES = '10',
  SCHEDULE_INTERVAL_SECONDS = '15',
} = process.env;

export { crypto };

export const scheduleTasks = async function scheduleTasks() {
  const now = new Date();
  const scoreboard = await updateDailyScoreboard({ isLive: false });
  if (!scoreboard) {
    log('Failed to load daily scoreboard');
    return {
      complete: false,
      time: now.toISOString(),
    };
  }

  const {
    gameDate,
    leagueName,
    games: scheduledGames,
  } = scoreboard;
  const numGames = scheduledGames.length;
  const nounGames = numGames === 1 ? 'game' : 'games';
  log(`Loaded ${leagueName} daily scoreboard for ${gameDate} with ${numGames} ${nounGames}`);

  // Set up scheduling constants
  const scheduleRateMs = Number(SCHEDULE_RATE_MINUTES) * 60 * 1000;
  const scheduleIntervalMs = Number(SCHEDULE_INTERVAL_SECONDS) * 1000;

  // Games that are live or starting soon
  const games = scheduledGames
    .filter(({ gameStatus, gameDateTime }) => {
      if (gameStatus === 2) return true;
      const startTime = new Date(gameDateTime);
      return startTime > now && (startTime - now) < scheduleRateMs;
    })
    .sort((a, b) => a.gameDateTime.localeCompare(b.gameDateTime));

  // Bail if there are no games to schedule
  if (games.length < 1) {
    log('No games need updating');
    return {
      complete: false,
      time: now.toISOString(),
    };
  }

  const messageBodies = [
    {
      task: UPDATE_DAILY_SCOREBOARD,
    },
    ...games.map((game) => ({
      task: UPDATE_GAME,
      gameId: game.gameId,
    })),
  ];

  // Update every INTERVAL seconds over the next RATE minutes. Offset by
  // INTERVAL seconds so that this batch of tasks ends as close as possible to
  // when the next batch is scheduled.
  const numUpdates = Math.floor(scheduleRateMs / scheduleIntervalMs);
  const messages = [...Array(numUpdates)].map((_, i) => ({
    delay: (i + 1) * (scheduleIntervalMs / 1000), // delay in seconds
    body: messageBodies,
  }));
  log(`Dispatching ${messages.length} messages to SQS`);

  await queueMessages({
    messages,
  });

  return {
    complete: true,
    time: now.toISOString(),
  };
};
