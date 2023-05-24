import fetchSchedule from './utils/fetch/fetchSchedule';
import upload from './utils/aws/upload';
import { TEN_MINUTES } from './utils/cache/ages';
import cacheControl from './utils/cache/cacheControl';

const updateSchedule = async function updateSchedule(opts = {}) {
  const {
    league = 'nba',
  } = opts;

  const schedule = await fetchSchedule({ league });
  if (!schedule) return schedule;

  const scheduleCacheControl = cacheControl(TEN_MINUTES);
  const now = new Date();
  const day = 1000 * 60 * 60 * 24; // 24h

  // upload full schedule
  await upload({
    key: `stats/${league}/global/schedule.json`,
    content: JSON.stringify(schedule),
    cacheControl: scheduleCacheControl,
  });

  // upload a list of just dates
  const dates = {
    ...schedule,
    gameDates: schedule.gameDates.map(({ gameDate }) => gameDate),
  };
  await upload({
    key: `stats/${league}/global/dates.json`,
    content: JSON.stringify(dates),
    cacheControl: scheduleCacheControl,
  });

  // upload individual daily schedules
  await schedule.gameDates.reduce(async (promise, date, i) => {
    const d = new Date(date.gameDate);
    if (d < now && (now - d) > day) {
      return;
    }

    if (i % 10 === 0) {
      await promise;
    }

    await upload({
      key: `stats/${league}/global/daily-schedule/${date.gameDate}.json`,
      content: JSON.stringify(date),
      cacheControl: scheduleCacheControl,
    });
  }, Promise.resolve());

  return schedule;
};

export default updateSchedule;
