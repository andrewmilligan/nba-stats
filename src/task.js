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

  // Parse array of actions out of message bodies
  const actions = records.reduce((recordActions, record) => {
    const body = JSON.parse(record.body || '[]');
    const bodyActions = [body].flat();
    return [...recordActions, ...bodyActions];
  }, []);

  // Split array of actions into batches
  const batchSize = 5;
  const numBatches = Math.ceil(actions.length / batchSize);
  const batches = [...Array(numBatches)].map((_, i) => (
    actions.slice(i * batchSize, (i + 1) * batchSize)
  ));

  // Handler function to execute a single task
  const handleTask = async (action) => {
    const {
      task: taskType,
      ...taskOpts
    } = action;

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
  };

  // Iterate through batches and handle all actions in each batch in parallel
  await batches.reduce(async (promise, batch) => {
    await promise;
    await Promise.all(batch.map(handleTask));
  }, Promise.resolve());

  return opts;
};
