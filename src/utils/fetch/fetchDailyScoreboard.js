import fetchJson from './fetchJson';

/**
 * Fetch today's league scoreboard.
 */
const fetchDailyScoreboard = async function fetchDailyScoreboard() {
  const url = 'https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json';
  const data = await fetchJson(url);
  if (!data) {
    return undefined;
  }

  const { scoreboard } = data;
  return {
    ...scoreboard,
    games: scoreboard.games.map((game) => ({
      gameDateTime: new Date(game.gameTimeUTC).toISOString(),
      ...game,
    })),
  };
};

export default fetchDailyScoreboard;
