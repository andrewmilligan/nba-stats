import unfetch from 'isomorphic-unfetch';

const fetchJson = async function fetchJson(url, opts) {
  try {
    const rsp = await unfetch(url, opts);
    if (!rsp.ok) {
      const msg = await rsp.text();
      throw new Error(`Error [${rsp.status}] fetching ${url}: ${msg}`);
    }

    const data = await rsp.json();
    return data;
  } catch (error) {
    // console.error(error);
    return undefined;
  }
};

export default fetchJson;
