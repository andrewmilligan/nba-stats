import fetchSchedule from '../src/utils/fetch/fetchSchedule';
import fetchBoxScore from '../src/utils/fetch/fetchBoxScore';
import upload from '../src/utils/aws/upload';

const main = async () => {
  console.log('Fetching NBA schedule');
  const schedule = await fetchSchedule();
  const allGames = schedule.gameDates
    .map(({ games }) => games)
    .flat()
    .filter(({ weekNumber, gameStatus }) => (
      gameStatus > 1 && weekNumber > 0
    ));

  console.log(`Pulling season stats for ${allGames.length} games`);

  const getPlayerStats = (game, teamKey) => {
    const {
      gameId,
      gameDateTime,
      [teamKey]: team,
    } = game;
    return team.players.map((player) => ({
      gameId,
      gameDateTime,
      personId: player.personId,
      starter: player.starter,
      played: player.played,
      ...player.statistics,
    }));
  };

  const teamStats = await allGames.reduce(async (promise, game) => {
    const map = await promise;
    const {
      gameId,
      gameDateTime,
      homeTeam: {
        teamId: homeTeamId,
        teamName: homeTeamName,
      },
      awayTeam: {
        teamId: awayTeamId,
        teamName: awayTeamName,
      },
    } = game;
    const ts = new Date(gameDateTime).toLocaleString();
    console.log(`[${gameId}] Pulling stats for ${awayTeamName} @ ${homeTeamName} on ${ts}`);
    const boxScore = await fetchBoxScore(game.gameId);

    map.set(homeTeamId, [
      ...(map.get(homeTeamId) || []),
      ...getPlayerStats(boxScore, 'homeTeam'),
    ]);
    map.set(awayTeamId, [
      ...(map.get(awayTeamId) || []),
      ...getPlayerStats(boxScore, 'awayTeam'),
    ]);

    return map;
  }, Promise.resolve(new Map()));

  await [...teamStats].reduce(async (promise, [teamId, stats]) => {
    await promise;
    console.log(`+ Uploading stats for ${teamId}`);
    const key = `stats/team/${teamId}/playerBoxScores.json`;
    await upload({
      key,
      content: JSON.stringify(stats),
    });
  }, Promise.resolve());
};

main();
