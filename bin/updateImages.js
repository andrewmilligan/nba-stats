/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-console */
import unfetch from 'isomorphic-unfetch';
import cheerio from 'cheerio';
import upload from '../src/utils/aws/upload';

async function getNextData(url) {
  const rsp = await unfetch(url);
  const html = await rsp.text();
  const $ = cheerio.load(html);
  const data = $('script#__NEXT_DATA__').text();
  return JSON.parse(data);
}

async function getWNBA() {
  const url = 'https://www.wnba.com/players';
  const nextData = await getNextData(url);
  const players = nextData.props.pageProps.allPlayersData;
  const playerIds = new Set();
  const teamIds = new Set();
  players.forEach((player) => {
    playerIds.add(player[0]);
    teamIds.add(player[4]);
  });
  return {
    teams: [...teamIds],
    players: [...playerIds],
  };
}

async function getNBA() {
  const url = 'https://www.nba.com/players';
  const nextData = await getNextData(url);
  const { players } = nextData.props.pageProps;
  const playerIds = new Set();
  const teamIds = new Set();
  players.forEach((player) => {
    playerIds.add(player.PERSON_ID);
    teamIds.add(player.TEAM_ID);
  });
  return {
    teams: [...teamIds],
    players: [...playerIds],
  };
}

async function main() {
  console.log('Fetching player and team data for NBA and WNBA');
  const [nba, wnba] = await Promise.all([
    getNBA(),
    getWNBA(),
  ]);

  const teams = [
    ...nba.teams.map((id) => ({ id, league: 'nba' })),
    ...wnba.teams.map((id) => ({ id, league: 'wnba' })),
  ];
  const players = [
    ...nba.players.map((id) => ({ id, league: 'nba' })),
    ...wnba.players.map((id) => ({ id, league: 'wnba' })),
  ];

  // team logos
  console.log('Updating team logos');
  await teams.reduce(async (promise, { id, league }, i) => {
    if (i % 5 === 0) {
      await promise;
    }
    await Promise.all(['L', 'D'].map(async (type) => {
      const url = `https://cdn.${league}.com/logos/${league}/${id}/primary/${type}/logo.svg`;
      const img = await unfetch(url);
      if (!img.status !== 200) {
        return;
      }
      const content = await img.arrayBuffer();
      await upload({
        key: `images/${league}/teams/logos/primary/${type}/${id}.svg`,
        content,
        contentType: 'image/svg+xml',
        cacheControl: 'max-age=86400',
      });
    }));
  }, Promise.resolve());

  // player headshots
  console.log('Updating player headshots');
  await players.reduce(async (promise, { id, league }, i) => {
    if (i % 5 === 0) {
      await promise;
    }
    const url = `https://cdn.${league}.com/headshots/${league}/latest/260x190/${id}.png`;
    const img = await unfetch(url);
    if (!img.status !== 200) {
      return;
    }
    const content = await img.arrayBuffer();
    await upload({
      key: `images/${league}/players/headshots/latest/small/${id}.png`,
      content,
      contentType: 'image/png',
      cacheControl: 'max-age=86400',
    });
  }, Promise.resolve());
}

main();
