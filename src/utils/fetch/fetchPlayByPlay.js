import fetchNbaLiveStat from './fetchNbaLiveStat';

/**
 * Fetch the play-by-play actions for a specific game.
 *
 * @param {string} gameId
 *        NBA game ID
 */
const fetchPlayByPlay = async function fetchPlayByPlay(gameId, opts) {
  const data = await fetchNbaLiveStat('playbyplay', gameId, opts);
  const { game = {} } = data || {};
  const { actions = [] } = game;
  return actions;
};

export default fetchPlayByPlay;
