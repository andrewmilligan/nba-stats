import { leagues } from '../leagues';
import fetchJson from './fetchJson';

/**
 * Fetch today's league scoreboard.
 */
const fetchDailyScoreboard = async function fetchDailyScoreboard(opts = {}) {
  const {
    league = 'nba',
  } = opts;

  const leagueId = leagues[league].id;
  const url = `https://cdn.${league}.com/static/json/liveData/scoreboard/todaysScoreboard_${leagueId}.json`;
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
