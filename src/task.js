/* eslint-disable import/prefer-default-export */
import crypto from './utils/crypto';
import updateGame from './updateGame';
import updateDailyScoreboard from './updateDailyScoreboard';
import log from './utils/log';
import {
  UPDATE_DAILY_SCOREBOARD,
  UPDATE_GAME,
} from './utils/tasks/types';

export { crypto };

export const task = async function task(opts = {}) {
  const {
    Records: records = [],
  } = opts;

  await records.reduce(async (promise, record) => {
    await promise;

    const {
      task: taskType,
      ...taskOpts
    } = JSON.parse(record.body || '{}');

    log(`Handling task ${taskType} with options ${JSON.stringify(taskOpts)}`);

    try {
      if (taskType === UPDATE_DAILY_SCOREBOARD) {
        await updateDailyScoreboard({ isLive: true });
      } else if (taskType === UPDATE_GAME) {
        const { gameId } = taskOpts;
        await updateGame(gameId);
      }
    } catch (error) {
      log('Failed to handle task');
      log(error);
    }
  }, Promise.resolve());

  return opts;
};
