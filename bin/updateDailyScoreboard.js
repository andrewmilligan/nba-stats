import updateDailyScoreboard from '../src/updateDailyScoreboard';
import getTeamRecords from '../src/utils/aws/ddb/getTeamRecords';
// import deleteDocument from '../src/utils/aws/ddb/deleteDocument';
// import {
//   TEAM_RECORDS,
//   CURRENT_SEASON,
// } from '../src/utils/aws/ddb/keys';

async function main() {
  // await deleteDocument({
  //   PrimaryKey: TEAM_RECORDS,
  //   SortKey: CURRENT_SEASON,
  // });
  await updateDailyScoreboard();
  const records = await getTeamRecords();
  console.log(records);
}

main();
