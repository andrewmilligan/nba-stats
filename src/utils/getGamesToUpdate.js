import { leaguesById } from './leagues';

const getGamesToUpdate = function getGamesToUpdate(
  scoreboards = [],
  opts = {},
) {
  const {
    scheduleRateMs,
  } = opts;

  const now = new Date();
  const leaguesWithGames = new Set();

  const games = scoreboards.map((scoreboard) => {
    const {
      leagueId,
      games: scheduledGames,
    } = scoreboard;

    const league = leaguesById[leagueId];

    const upcomingGames = scheduledGames
      .filter(({ gameStatus, gameDateTime }) => {
        if (gameStatus === 2) return true;
        const startTime = new Date(gameDateTime);
        return startTime > now && (startTime - now) < scheduleRateMs;
      })
      .sort((a, b) => a.gameDateTime.localeCompare(b.gameDateTime));

    if (upcomingGames.length > 0) {
      leaguesWithGames.add(league.slug);
    }

    return upcomingGames.map((game) => ({
      league: league.slug,
      game,
    }));
  });

  return {
    leagues: [...leaguesWithGames],
    games: games.flat(),
  };
};

export default getGamesToUpdate;
