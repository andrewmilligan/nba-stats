/* eslint-disable import/prefer-default-export */
import crypto from './utils/crypto';
import updateDailyScoreboard from './updateDailyScoreboard';
import queueMessages from './utils/aws/queueMessages';
import log from './utils/log';
import {
  UPDATE_SCHEDULE,
  UPDATE_DAILY_SCOREBOARD,
  UPDATE_GAME,
} from './utils/tasks/types';
import { leagues } from './utils/leagues';
import getGamesToUpdate from './utils/getGamesToUpdate';

const {
  SCHEDULE_RATE_MINUTES = '10',
  SCHEDULE_INTERVAL_SECONDS = '15',
} = process.env;

export { crypto };

export const scheduleTasks = async function scheduleTasks() {
  const now = new Date();

  const shouldUpdateSchedules = (
    now.getUTCHours() === 7
    && now.getUTCMinutes() <= 10
  );

  const leagueSlugs = Object.keys(leagues);
  const scoreboardValues = await Promise.all(leagueSlugs.map((league) => (
    updateDailyScoreboard({ isLive: false, league })
  )));
  const scoreboards = scoreboardValues.filter(Boolean);
  if (scoreboards.length < 1) {
    log('Failed to load daily scoreboards');
    return {
      complete: false,
      time: now.toISOString(),
    };
  }

  // Set up scheduling constants
  const scheduleRateMs = Number(SCHEDULE_RATE_MINUTES) * 60 * 1000;
  const scheduleIntervalMs = Number(SCHEDULE_INTERVAL_SECONDS) * 1000;

  const {
    leagues: leaguesToUpdate,
    games,
  } = getGamesToUpdate(scoreboards, { scheduleRateMs });

  // Bail if there are no games to schedule
  if (games.length < 1 && !shouldUpdateSchedules) {
    log('No games need updating');
    return {
      complete: true,
      time: now.toISOString(),
    };
  }

  const messageBodies = [
    ...leaguesToUpdate.map((league) => ({
      task: UPDATE_DAILY_SCOREBOARD,
      league,
    })),
    ...games.map(({ league, game }) => ({
      task: UPDATE_GAME,
      gameId: game.gameId,
      league,
    })),
  ];

  if (shouldUpdateSchedules) {
    Object.keys(leagues).forEach((league) => {
      messageBodies.push({
        task: UPDATE_SCHEDULE,
        league,
      });
    });
  }

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
