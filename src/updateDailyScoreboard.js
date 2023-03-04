import fetchDailyScoreboard from './utils/fetch/fetchDailyScoreboard';
import upload from './utils/aws/upload';
import log from './utils/log';
import cacheControl from './utils/cache/cacheControl';
import { TEN_MINUTES, FIVE_MINUTES, TEN_SECONDS } from './utils/cache/ages';
import updateTeamRecords from './utils/aws/ddb/updateTeamRecords';

const updateDailyScoreboard = async function updateDailyScoreboard(opts = {}) {
  const {
    isLive = false,
  } = opts;

  const scheduleCacheControl = cacheControl(TEN_MINUTES);
  const scoreboardCacheControl = isLive
    ? cacheControl(TEN_SECONDS)
    : cacheControl(FIVE_MINUTES);

  const scoreboard = await fetchDailyScoreboard();
  if (scoreboard) {
    const { gameDate, games } = scoreboard;
    log(`Loaded scoreboard for ${gameDate} with ${games.length} games`);

    const teamRecords = games.reduce((records, game) => {
      records.push({
        teamId: game.homeTeam.teamId,
        wins: game.homeTeam.wins,
        losses: game.homeTeam.losses,
      });
      records.push({
        teamId: game.awayTeam.teamId,
        wins: game.awayTeam.wins,
        losses: game.awayTeam.losses,
      });
      return records;
    }, []);

    const content = JSON.stringify(scoreboard);
    const updateValues = await Promise.allSettled([
      upload({
        key: 'stats/global/scoreboard.json',
        content,
        cacheControl: scoreboardCacheControl,
      }),
      upload({
        key: `stats/global/daily-schedule/${gameDate}.json`,
        content,
        cacheControl: scheduleCacheControl,
      }),
      updateTeamRecords({
        teams: teamRecords,
      }),
    ]);

    const teamRecordsUpdate = updateValues[2];
    if (
      teamRecordsUpdate.status === 'fulfilled'
      && teamRecordsUpdate.value
    ) {
      const recordContent = JSON.stringify(teamRecordsUpdate.value);
      await upload({
        key: 'stats/global/records.json',
        content: recordContent,
        cacheControl: cacheControl(FIVE_MINUTES),
      });
    }
  } else {
    log('Failed to load scoreboard');
  }
  return scoreboard;
};

export default updateDailyScoreboard;
