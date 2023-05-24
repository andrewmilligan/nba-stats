import fetchBoxScore from './utils/fetch/fetchBoxScore';
import fetchPlayByPlay from './utils/fetch/fetchPlayByPlay';
import upload from './utils/aws/upload';
import { TEN_MINUTES, TEN_SECONDS } from './utils/cache/ages';
import cacheControl from './utils/cache/cacheControl';

/**
 * Update stats for a game by ID.
 *
 * @param {string} gameId
 *        NBA game ID
 */
const updateGame = async function updateGame(gameId, opts = {}) {
  const {
    league = 'nba',
  } = opts;

  const [boxScore, playByPlay] = await Promise.all([
    fetchBoxScore(gameId, { league }),
    fetchPlayByPlay(gameId, { league }),
  ]);

  const msToGame = new Date(boxScore.gameTimeUTC) - new Date();
  const secondsToGame = msToGame / 1000;
  const gameIsSoon = boxScore.gameStatus === 1 && secondsToGame < TEN_MINUTES;
  const gameIsLive = boxScore.gameStatus === 2 || gameIsSoon;
  const gameCacheControl = gameIsLive
    ? cacheControl(TEN_SECONDS)
    : cacheControl(TEN_MINUTES);

  await Promise.all([
    // upload box score
    upload({
      key: `stats/${league}/game/${gameId}/boxscore.json`,
      content: JSON.stringify(boxScore),
      cacheControl: gameCacheControl,
    }),

    // upload play-by-play
    upload({
      key: `stats/${league}/game/${gameId}/playbyplay.json`,
      content: JSON.stringify(playByPlay),
      cacheControl: gameCacheControl,
    }),
  ]);

  return {
    boxScore,
    playByPlay,
  };
};

export default updateGame;
