/* eslint-disable import/prefer-default-export */
import crypto from './utils/crypto';
import fetchDailyScoreboard from './utils/fetch/fetchDailyScoreboard';
import queueMessages from './utils/aws/queueMessages';
import log from './utils/log';
import {
  UPDATE_DAILY_SCOREBOARD,
  UPDATE_GAME,
} from './utils/tasks/types';

const {
  SCHEDULE_RATE_MINUTES = '10',
  SCHEDULE_INTERVAL_SECONDS = '10',
} = process.env;

export { crypto };

export const scheduleTasks = async function scheduleTasks() {
  const now = new Date();
  const scoreboard = await fetchDailyScoreboard();
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

  // Update every INTERVAL seconds over the next RATE minutes
  const numUpdates = scheduleRateMs / scheduleIntervalMs;
  const batches = [...Array(numUpdates)].map((_, i) => (
    messageBodies.map((body) => ({
      delay: i * (scheduleIntervalMs / 1000), // delay in seconds
      body,
    }))
  ));
  const messages = batches.flat();
  log(`Dispatching ${messages.length} messages to SQS`);
  log(batches);

  await queueMessages({
    messages,
  });

  return {
    complete: true,
    time: now.toISOString(),
  };
};
