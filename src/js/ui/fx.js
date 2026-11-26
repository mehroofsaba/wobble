// Plays an fx event (eat, play, levelup...) on a pet view. Sound only plays in the window
// that triggered the action (remote === false) so nothing is heard twice.
import { sfx } from '../engine/audio.js';
import { icon } from './icons.js';

export function playFx(view, type, p = {}, { remote = false, toast = null } = {}) {
  const snd = (n) => { if (!remote) sfx(n); };
  switch (type) {
    case 'eat':
      view.dropFood(p.food);
      setTimeout(() => { view.anim('eat', 1700); view.face(p.reaction === 'dislike' ? 'ew' : 'eating', 1500); snd('chomp'); }, 650);
      setTimeout(() => {
        view.fx(['•', '·'], 4);
        if (p.reaction === 'love') { view.fx('♡', 5); view.anim('celebrate', 1400); snd('reward'); }
        else if (p.reaction === 'dislike') snd('bad');
        else { view.fx('♡', 2); snd('boop'); }
        view.say(p.text);
      }, 2200);
      break;
    case 'play':
      view.toy('yarn', 2600); view.anim('play', 2600); view.face('cheer', 2600); snd('boop');
      setTimeout(() => { view.fx('♡', 3); view.say(p.text); }, 2500);
      break;
    case 'cleaned':
      view.anim('celebrate', 1500); view.face('cheer', 1500); view.fx(['✦', '✧'], 9); snd('reward'); view.say(p.text);
      break;
    case 'sleep': view.say(p.text); snd('sleep'); break;
    case 'wake': view.anim('react', 800); view.say(p.text); snd('wake'); break;
    case 'react': view.anim('react', 700); break;
    case 'levelup':
      view.anim('celebrate', 2200); view.face('cheer', 2200); view.fx(['✦', '♡', '✧'], 10); snd('levelup');
      view.say(`level ${p.level}!!`, 5000);
      toast && toast({ icon: icon('star', 26), title: `Level ${p.level}`, text: 'Bonus stardust added' });
      break;
    case 'achievement':
      snd('reward'); toast && toast({ icon: icon(p.icon, 28), title: 'Achievement unlocked', text: p.name });
      break;
    case 'daily':
      snd('coin'); view.anim('celebrate', 1600); view.fx(['✧', '♡'], 8);
      toast && toast({ icon: icon('gift', 26), title: 'Daily reward', text: `+${p.amount} stardust  ·  day ${p.streak}${p.bonusFood ? '  ·  +2 fish snacks' : ''}` });
      break;
    case 'cheer-game': view.anim('celebrate', 1800); view.face('cheer', 1800); view.fx(['♡', '✦'], 6); break;
    case 'bought': snd('coin'); view.fx('✧', 3); break;
    case 'bonk': snd('bad'); break;
    default: break;
  }
}
