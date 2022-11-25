import fetch from 'isomorphic-unfetch';

import updateSchedule from '../src/updateSchedule';
import updateGame from '../src/updateGame';
import upload from '../src/utils/aws/upload';
import loadedTeams from '../teams.json';
import loadedPlayers from '../players.json';

const main = async () => {
  console.log('Fetching NBA schedule');
  const schedule = await updateSchedule();
  const allGames = schedule.gameDates
    .map(({ games }) => games)
    .flat()
    .filter(({ gameDateTime, gameStatus }) => (
      gameStatus > 1 && new Date(gameDateTime) > new Date('2022-10-02')
    ));

  console.log(`Backfilling ${allGames.length} games`);

  const teams = new Set(loadedTeams);
  const players = new Set(loadedPlayers);
  console.log(teams);

  const copyImage = async (opts = {}) => {
    const {
      url,
      key,
      contentType,
    } = opts;
    const rsp = await fetch(url);
    const arrayBuffer = await rsp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await upload({
      key,
      content: buffer,
      contentType,
    });
  };

  const getTeamImages = async (team) => {
    if (!team) return;

    // team logos
    const logoDarkUrl = `https://cdn.nba.com/logos/nba/${team.teamId}/primary/D/logo.svg`;
    const logoLightUrl = `https://cdn.nba.com/logos/nba/${team.teamId}/primary/L/logo.svg`;
    if (!teams.has(team.teamId)) {
      console.log(`Fetching logos for ${team.teamCity} ${team.teamName} [${team.teamId}]`);
      await Promise.all([
        copyImage({
          url: logoDarkUrl,
          key: `images/teams/logos/${team.teamId}/primary/D/logo.svg`,
          contentType: 'image/svg+xml',
        }),
        copyImage({
          url: logoLightUrl,
          key: `images/teams/logos/${team.teamId}/primary/L/logo.svg`,
          contentType: 'image/svg+xml',
        }),
      ]);
    }
    teams.add(team.teamId);

    await team.players.reduce(async (promise, { personId, name }) => {
      await promise;
      if (!players.has(personId)) {
        console.log(`Fetching headshots for ${name} [${personId}]`);
        await Promise.all([
          copyImage({
            url: `https://cdn.nba.com/headshots/nba/latest/1040x760/${personId}.png`,
            key: `images/players/headshots/latest/large/${personId}.png`,
            contentType: 'image/png',
          }),
          copyImage({
            url: `https://cdn.nba.com/headshots/nba/latest/260x190/${personId}.png`,
            key: `images/players/headshots/latest/small/${personId}.png`,
            contentType: 'image/png',
          }),
        ]);
      }
      players.add(personId);
    }, Promise.resolve());
  };

  await allGames.reduce(async (promise, game) => {
    await promise;
    const {
      gameId,
      gameDateTime,
      homeTeam: {
        teamName: homeTeamName,
      },
      awayTeam: {
        teamName: awayTeamName,
      },
    } = game;
    const ts = new Date(gameDateTime).toLocaleString();
    console.log(`[${gameId}] Backfilling ${awayTeamName} @ ${homeTeamName} on ${ts}`);
    const { boxScore } = await updateGame(game.gameId);
    await getTeamImages(boxScore.homeTeam);
    await getTeamImages(boxScore.awayTeam);
  }, Promise.resolve());

  // setTimeout(main, 6 * 1000);
};

main();
