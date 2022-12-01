/* eslint-disable import/no-extraneous-dependencies, no-console */
import updateGame from '../src/updateGame';

const { gameId } = require('yargs')
  .options({
    gameId: {
      alias: 'g',
      type: 'string',
    },
  })
  .argv;

const main = async () => {
  console.log(`Updating game [${gameId}]`);
  await updateGame(gameId);
};

if (!gameId) {
  console.error('Please specify a game ID with --game-id (-g)');
  process.exit(1);
}

main(gameId);
