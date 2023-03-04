import updateDocument from './updateDocument';
import putDocument from './putDocument';
import { TEAM_RECORDS, CURRENT_SEASON } from './keys';

const updateTeamRecords = async function updateTeamRecords({
  teams = [],
}) {
  // document key to update
  const key = {
    PrimaryKey: TEAM_RECORDS,
    SortKey: CURRENT_SEASON,
  };

  // set up update expression and attribute values
  const updateOptions = teams.reduce((options, team) => {
    const {
      teamId,
      wins,
      losses,
    } = team;

    // define variable names
    const teamName = `#team${teamId}`;
    const valueVariable = `:record${teamId}`;

    // set variable names
    options.names.push([teamName, `${teamId}`]);

    // set variable values
    const record = { wins, losses };
    options.values.push([valueVariable, record]);
    options.records.push([teamId, record]);

    // add expression
    options.expressions.push(`teams.${teamName} = ${valueVariable}`);

    return options;
  }, {
    expressions: [],
    names: [],
    values: [],
    records: [],
  });

  let createdTeamRecords = false;
  let data = {};
  try {
    // update document
    const updates = await updateDocument(
      key,
      {
        UpdateExpression: `SET ${updateOptions.expressions.join(', ')}`,
        ExpressionAttributeNames: Object.fromEntries(updateOptions.names),
        ExpressionAttributeValues: Object.fromEntries(updateOptions.values),
        ReturnValues: 'ALL_OLD',
      },
    );
    data = updates.Attributes.teams;
  } catch (error) {
    if (error.name !== 'ValidationException') throw error;

    // we need an initial value
    createdTeamRecords = true;
    data = Object.fromEntries(updateOptions.records);
    await putDocument({
      ...key,
      teams: data,
    });
  }

  const teamUpdates = new Map(teams.map(({ teamId, wins, losses }) => [
    teamId,
    { wins, losses },
  ]));

  const getIsUpdated = ({ isUpdated, oldRecord, newRecord }) => {
    if (isUpdated) return true;
    if (!oldRecord) return true;
    if (!newRecord) return false;
    return (
      oldRecord.wins !== newRecord.wins
      || oldRecord.losses !== newRecord.losses
    );
  };

  const dataIfUpdated = Object.entries(data)
    .reduce(({ records, isUpdated }, [teamId, record]) => {
      const recordUpdate = teamUpdates.get(teamId);
      const newRecord = recordUpdate || record;
      records.push([teamId, newRecord]);
      return {
        records,
        isUpdated: getIsUpdated({
          isUpdated,
          oldRecord: record,
          newRecord,
        }),
      };
    }, {
      records: [],
      isUpdated: createdTeamRecords,
    });

  if (!dataIfUpdated.isUpdated) return undefined;
  return Object.fromEntries(dataIfUpdated.records);
};

export default updateTeamRecords;
