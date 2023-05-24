import updateSchedule from '../src/updateSchedule';

async function update() {
  await updateSchedule({ league: 'nba' });
  await updateSchedule({ league: 'wnba' });
}

update();
