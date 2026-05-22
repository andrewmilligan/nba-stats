import fetchJson from './fetchJson.js';

const fetchNbaJson = async function fetchNbaJson(url, opts = {}) {
  const { headers = {} } = opts;
  const rsp = await fetchJson(url, {
    ...opts,
    headers: {
      ...headers,
      referer: 'https://www.nba.com/',
    },
  });
  return rsp;
};

export default fetchNbaJson;
