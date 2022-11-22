import fetchNbaLiveStat from './fetchNbaLiveStat';

/**
 * Fetch the box score for a specific game.
 *
 * @param {string} gameId
 *        NBA game ID
 */
const fetchBoxScore = async function fetchBoxScore(gameId) {
  const data = await fetchNbaLiveStat('boxscore', gameId);
  const { game = {} } = data || {};
  return game;
};

export default fetchBoxScore;
