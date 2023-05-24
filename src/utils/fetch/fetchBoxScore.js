import fetchNbaLiveStat from './fetchNbaLiveStat';

/**
 * Fetch the box score for a specific game.
 *
 * @param {string} gameId
 *        NBA game ID
 */
const fetchBoxScore = async function fetchBoxScore(gameId, opts) {
  const data = await fetchNbaLiveStat('boxscore', gameId, opts);
  const { game = {} } = data || {};
  return game;
};

export default fetchBoxScore;
