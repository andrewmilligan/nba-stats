import updateSchedule from '../src/updateSchedule.js';

async function update() {
  await updateSchedule({ league: 'nba' });
  await updateSchedule({ league: 'wnba' });
}

update();
