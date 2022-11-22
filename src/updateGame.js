import fetchBoxScore from './utils/fetch/fetchBoxScore';
import fetchPlayByPlay from './utils/fetch/fetchPlayByPlay';
import upload from './utils/aws/upload';

/**
 * Update stats for a game by ID.
 *
 * @param {string} gameId
 *        NBA game ID
 */
const updateGame = async function updateGame(gameId) {
  const [boxScore, playByPlay] = await Promise.all([
    fetchBoxScore(gameId),
    fetchPlayByPlay(gameId),
  ]);

  await Promise.all([
    // upload box score
    upload({
      key: `stats/game/${gameId}/boxscore.json`,
      content: JSON.stringify(boxScore),
    }),

    // upload play-by-play
    upload({
      key: `stats/game/${gameId}/playbyplay.json`,
      content: JSON.stringify(playByPlay),
    }),
  ]);

  return {
    boxScore,
    playByPlay,
  };
};

export default updateGame;
