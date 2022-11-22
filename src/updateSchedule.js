import fetchSchedule from './utils/fetch/fetchSchedule';
import upload from './utils/aws/upload';

const updateSchedule = async function updateSchedule() {
  const schedule = await fetchSchedule();
  if (!schedule) return schedule;

  // upload full schedule
  await upload({
    key: 'stats/global/schedule.json',
    content: JSON.stringify(schedule),
  });

  // upload a list of just dates
  const dates = {
    ...schedule,
    gameDates: schedule.gameDates.map(({ gameDate }) => gameDate),
  };
  await upload({
    key: 'stats/global/dates.json',
    content: JSON.stringify(dates),
  });

  // upload individual daily schedules
  await schedule.gameDates.reduce(async (promise, date) => {
    await promise;
    await upload({
      key: `stats/global/daily-schedule/${date.gameDate}.json`,
      content: JSON.stringify(date),
    });
  }, Promise.resolve());

  return schedule;
};

export default updateSchedule;
