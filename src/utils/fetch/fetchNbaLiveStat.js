import fetchJson from './fetchJson';

/**
 * Fetch a live NBA stat for a specific game.
 *
 * @param {string} gameId
 *        NBA game ID
 */
const fetchNbaLiveStat = async function fetchNbaLiveStat(
  stat,
  gameId,
  opts = {},
) {
  const {
    league = 'nba',
  } = opts;

  const name = `${stat}_${gameId}.json`;
  const url = `https://cdn.${league}.com/static/json/liveData/${stat}/${name}`;
  const data = await fetchJson(url);
  return data;
};

export default fetchNbaLiveStat;
