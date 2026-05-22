import getDocument from './getDocument.js';
import { TEAM_RECORDS, CURRENT_SEASON } from './keys.js';

const getTeamRecords = async function getTeamRecords() {
  const records = await getDocument({
    PrimaryKey: TEAM_RECORDS,
    SortKey: CURRENT_SEASON,
  });
  return records;
};

export default getTeamRecords;
