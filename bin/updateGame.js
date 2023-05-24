/* eslint-disable import/no-extraneous-dependencies, no-console */
import updateGame from '../src/updateGame';

const { gameId, league } = require('yargs')
  .options({
    gameId: {
      alias: 'g',
      type: 'string',
    },
    league: {
      type: 'string',
      default: 'nba',
    },
  })
  .argv;

const main = async () => {
  console.log(`Updating game [${gameId}]`);
  await updateGame(gameId, { league });
};

if (!gameId) {
  console.error('Please specify a game ID with --game-id (-g)');
  process.exit(1);
}

main(gameId);
