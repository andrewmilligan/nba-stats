import fetchSchedule from './utils/fetch/fetchSchedule';
import upload from './utils/aws/upload';
import { TEN_MINUTES } from './utils/cache/ages';
import cacheControl from './utils/cache/cacheControl';

const updateSchedule = async function updateSchedule() {
  const schedule = await fetchSchedule();
  if (!schedule) return schedule;

  const scheduleCacheControl = cacheControl(TEN_MINUTES);

  // upload full schedule
  await upload({
    key: 'stats/global/schedule.json',
    content: JSON.stringify(schedule),
    cacheControl: scheduleCacheControl,
  });

  // upload a list of just dates
  const dates = {
    ...schedule,
    gameDates: schedule.gameDates.map(({ gameDate }) => gameDate),
  };
  await upload({
    key: 'stats/global/dates.json',
    content: JSON.stringify(dates),
    cacheControl: scheduleCacheControl,
  });

  // upload individual daily schedules
  await schedule.gameDates.reduce(async (promise, date) => {
    await promise;
    await upload({
      key: `stats/global/daily-schedule/${date.gameDate}.json`,
      content: JSON.stringify(date),
      cacheControl: scheduleCacheControl,
    });
  }, Promise.resolve());

  return schedule;
};

export default updateSchedule;
