export const leagues = {
  nba: {
    id: '00',
    name: 'NBA',
    slug: 'nba',
  },
  wnba: {
    id: '10',
    name: 'WNBA',
    slug: 'wnba',
  },
};

export const leaguesById = Object.fromEntries(
  Object.values(leagues).map((league) => [
    league.id,
    league,
  ]),
);
