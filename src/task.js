import updateGame from './updateGame';
import updateDailyScoreboard from './updateDailyScoreboard';

const task = async function task(opts = {}) {
  const {
    task: taskType,
    ...taskOpts
  } = opts;

  if (taskType === 'update-daily-scoreboard') {
    await updateDailyScoreboard();
  } else if (taskType === 'update-game') {
    const { gameId } = taskOpts;
    await updateGame(gameId);
  }
};

export default task;
