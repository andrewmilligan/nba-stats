import getDocument from './getDocument';
import { TEAM_RECORDS, CURRENT_SEASON } from './keys';

const getTeamRecords = async function getTeamRecords() {
  const records = await getDocument({
    PrimaryKey: TEAM_RECORDS,
    SortKey: CURRENT_SEASON,
  });
  return records;
};

export default getTeamRecords;
