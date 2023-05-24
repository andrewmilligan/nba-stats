import fetchJson from './fetchJson';

/**
 * Fetch the season schedule.
 */
const fetchSchedule = async function fetchSchedule(opts = {}) {
  const {
    league = 'nba',
  } = opts;

  const url = `https://cdn.${league}.com/static/json/staticData/scheduleLeagueV2_1.json`;
  const data = await fetchJson(url);
  if (!data) {
    return undefined;
  }

  const { leagueSchedule } = data;

  const formatGame = (game) => ({
    gameId: game.gameId,
    gameStatus: game.gameStatus,
    gameStatusText: game.gameStatusText,
    gameDateTime: new Date(game.gameDateTimeUTC).toISOString(),
    arenaName: game.arenaName,
    arenaState: game.arenaState,
    arenaCity: game.arenaCity,
    weekNumber: game.weekNumber,
    weekName: game.weekName,
    ifNecessary: game.ifNecessary,
    homeTeam: game.homeTeam,
    awayTeam: game.awayTeam,
  });

  const {
    gameDates: scheduledGameDates,
    weeks,
    broadcasterList,
    ...restSchedule
  } = leagueSchedule;

  const gameDates = scheduledGameDates.map(({ gameDate, games }) => {
    const date = new Date(gameDate).toISOString().split('T')[0];
    return {
      gameDate: date,
      games: games.map(formatGame),
    };
  });

  return {
    ...restSchedule,
    gameDates,
  };
};

export default fetchSchedule;
