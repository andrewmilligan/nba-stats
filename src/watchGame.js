import inquirer from 'inquirer';

import fetchDailyLineups from './fetchDailyLineups';
import fetchPlayByPlay from './fetchPlayByPlay';

const watchGame = async function watchGame() {
  const { date } = await inquirer.prompt([
    {
      type: 'input',
      name: 'date',
      message: 'Game date',
      default: () => {
        const [month, day, year] = new Date().toLocaleDateString().split('/');
        return [year, month, day].join('-');
      },
    },
  ]);

  const games = await fetchDailyLineups(date);
  if (games.length < 1) {
    return;
  }

  const gamesByName = Object.fromEntries(games.map((game) => {
    const homeTeam = game.homeTeam.teamAbbreviation;
    const awayTeam = game.awayTeam.teamAbbreviation;
    const status = game.gameStatusText.trim();
    const name = `${awayTeam} @ ${homeTeam} (${status}) [${game.gameId}]`;
    return [name, game];
  }));

  const { gameName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'gameName',
      message: 'Game',
      choices: Object.keys(gamesByName),
    },
  ]);
  const game = gamesByName[gameName];

  const formatAction = (action) => {
    const {
      period,
      clock: time,
      description,
      scoreHome,
      scoreAway,
      teamTricode,
      actionType,
      subType,
    } = action;
    const score = `${scoreHome} - ${scoreAway}`;
    return [
      period,
      time,
      teamTricode,
      actionType,
      subType,
      description,
      score,
    ].filter(Boolean).join(' ');
  };

  const seenActionIds = new Set();
  const pollPlayByPlay = async () => {
    const playByPlay = await fetchPlayByPlay(game.gameId);
    playByPlay.forEach((action) => {
      if (seenActionIds.has(action.actionNumber)) {
        return;
      }

      // eslint-disable-next-line no-console
      console.log(formatAction(action));

      seenActionIds.add(action.actionNumber);
    });
    setTimeout(pollPlayByPlay, 5 * 1000);
  };

  pollPlayByPlay();
};

export default watchGame;
