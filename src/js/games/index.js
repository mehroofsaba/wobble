// Game registry. To add a mini-game: create games/<name>.js exporting `meta` and `start(stage, api)`,
// then add it to this list. Nothing else needs to change.
import * as fishing from './fishing.js';
import * as memory from './memory.js';
import * as hop from './hop.js';
import * as stars from './stars.js';

export const GAMES = [fishing, memory, hop, stars];
export const gameById = (id) => GAMES.find((g) => g.meta.id === id);
