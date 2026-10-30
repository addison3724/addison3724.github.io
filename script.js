// One entry per clip. file = the video in clips-web/, dur = length shown in the list,
// skills = the tags, desc = the caption. Reorder, retag or recaption freely; the player follows this list.
const INTRO_SECONDS = 6;   // how long the info card shows before the first clip
const clips = [
  { intro: true,                        dur: INTRO_SECONDS + 's', skills: ['Intro'], desc: 'Addison Cravotta | Defender | Class of 2027' },
  { file: 'pinerichland_clip1.mp4',     dur: '13s', skills: ['Add tags'],            desc: 'vs. Pine-Richland — clip description' },
  { file: 'northallegheny_clip1.mp4',   dur: '8s',  skills: ['Add tags'],            desc: 'vs. North Allegheny — clip description' },
  { file: 'northallegheny_clip2.mp4',   dur: '6s',  skills: ['Add tags'],            desc: 'vs. North Allegheny — clip description' },
  { file: 'northallegheny_clip3.mp4',   dur: '17s', skills: ['Add tags'],            desc: 'vs. North Allegheny — clip description' },
  { file: 'northallegheny_clip4.mp4',   dur: '9s',  skills: ['Add tags'],            desc: 'vs. North Allegheny — clip description' },
  { file: 'northhills_clip1.mp4',       dur: '10s', skills: ['Add tags'],            desc: 'vs. North Hills — clip description' },
  { file: 'northhills_clip2.mp4',       dur: '10s', skills: ['Add tags'],            desc: 'vs. North Hills — clip description' },
  { file: 'butler_clip1.mp4',           dur: '9s',  skills: ['Add tags'],            desc: 'vs. Butler — clip description' },
  { file: 'butler_clip2.mp4',           dur: '10s', skills: ['Add tags'],            desc: 'vs. Butler — clip description' },
  { file: 'butler_clip3.mp4',           dur: '8s',  skills: ['Add tags'],            desc: 'vs. Butler — clip description' },
  { file: 'butler_clip4.mp4',           dur: '6s',  skills: ['Add tags'],            desc: 'vs. Butler — clip description' },
  { file: 'foxchapel_clip1.mp4',        dur: '10s', skills: ['Add tags'],            desc: 'vs. Fox Chapel — clip description' },
  { file: 'franklinregional_clip1.mp4', dur: '8s',  skills: ['Add tags'],            desc: 'vs. Franklin Regional — clip description' },
  { file: 'franklinregional_clip2.mp4', dur: '6s',  skills: ['Add tags'],            desc: 'vs. Franklin Regional — clip description' },
  { file: 'franklinregional_clip3.mp4', dur: '8s',  skills: ['Add tags'],            desc: 'vs. Franklin Regional — clip description' },
  { file: 'franklinregional_clip4.mp4', dur: '11s', skills: ['Add tags'],            desc: 'vs. Franklin Regional — clip description' },
  { file: 'gateway_clip1.mp4',          dur: '9s',  skills: ['Add tags'],            desc: 'vs. Gateway — clip description' },
  { file: 'gateway_clip2.mp4',          dur: '11s', skills: ['Add tags'],            desc: 'vs. Gateway — clip description' },
  { file: 'gateway_clip3.mp4',          dur: '11s', skills: ['Add tags'],            desc: 'vs. Gateway — clip description' },
];
const CLIP_DIR = 'clips-web/';
let current = 0;
const list = document.getElementById('clips');
const setCurrentClip = i => list.querySelectorAll('.clip').forEach((el, j) => el.setAttribute('aria-current', j === i ? 'true' : 'false'));
clips.forEach((c, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.className = 'clip'; b.id = 'clip-' + (i + 1);
  b.setAttribute('aria-current', i === 0 ? 'true' : 'false');
  b.innerHTML = `<div class="head"><span class="num">${i + 1}</span><span class="dur">${c.dur}</span></div>
    <div class="skills">${c.skills.map(s => `<span class="skill">${s}</span>`).join('')}</div>
    <div class="desc">${c.desc}</div>`;
  b.addEventListener('click', () => loadClip(i, true));
  list.appendChild(b);
});

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.setAttribute('aria-selected', 'false'));
    tab.setAttribute('aria-selected', 'true');
    document.querySelectorAll('.panel').forEach(p => p.hidden = p.id !== tab.getAttribute('aria-controls'));
  });
});

document.getElementById('share-link').addEventListener('click', e => {
  e.preventDefault();
  const url = location.href;
  const link = e.currentTarget;
  navigator.clipboard?.writeText(url).then(() => { link.lastChild.textContent = ' Link copied'; setTimeout(() => link.lastChild.textContent = ' Share Link', 1500); }).catch(() => {});
});

// Highlight reel video player
const player = document.getElementById('player');
const video = document.getElementById('reel-video');
const playBtn = document.getElementById('play');
const bar = player.querySelector('.progress i');
const fmt = t => { t = Math.floor(t || 0); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
const PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5v14l12-7z"/></svg>';
const PAUSE_ICON = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';

// The intro "clip" is the info card itself, shown for INTRO_SECONDS with the progress bar running.
let introTimer = null, introElapsed = 0, introLast = 0;
function introTick(now) {
  introElapsed += (now - introLast) / 1000; introLast = now;
  bar.style.width = Math.min(100, introElapsed / INTRO_SECONDS * 100) + '%';
  document.getElementById('time-cur').textContent = fmt(introElapsed);
  if (introElapsed >= INTRO_SECONDS) { introTimer = null; loadClip(current + 1, true); return; }
  introTimer = requestAnimationFrame(introTick);
}
function introPlay() {
  introLast = performance.now(); introTimer = requestAnimationFrame(introTick);
  playBtn.innerHTML = PAUSE_ICON; playBtn.setAttribute('aria-label', 'Pause');
}
function introPause() {
  cancelAnimationFrame(introTimer); introTimer = null;
  playBtn.innerHTML = PLAY_ICON; playBtn.setAttribute('aria-label', 'Play');
}
const inIntro = () => !!clips[current].intro;

// Load clip i; autoplay=true starts it right away. Wraps around at either end.
function loadClip(i, autoplay) {
  if (introTimer) introPause();
  current = (i + clips.length) % clips.length;
  setCurrentClip(current);
  bar.style.width = '0%';
  document.getElementById('time-cur').textContent = '00:00';
  if (inIntro()) {
    video.pause(); video.removeAttribute('src'); video.load();
    player.classList.remove('playing', 'started');          // full card with the action photo
    document.getElementById('time-end').textContent = fmt(INTRO_SECONDS);
    introElapsed = 0;
    if (autoplay) introPlay();
    return;
  }
  video.src = CLIP_DIR + clips[current].file;
  if (autoplay) video.play().catch(() => {});
  // Preload the next clip so auto-advance is seamless
  const next = clips[(current + 1) % clips.length];
  if (next.file) {
    const pre = document.getElementById('preload-next') || Object.assign(document.createElement('link'), { id: 'preload-next', rel: 'prefetch' });
    pre.href = CLIP_DIR + next.file;
    document.head.appendChild(pre);
  }
}
const togglePlay = () => {
  if (inIntro()) { introTimer ? introPause() : introPlay(); return; }
  video.paused ? video.play() : video.pause();
};
playBtn.addEventListener('click', togglePlay);
// Full screen: the whole player when the browser allows it (keeps the intro card and clip hand-offs),
// otherwise just the video (iPhone Safari).
const fsBtn = document.getElementById('fullscreen');
fsBtn.addEventListener('click', () => {
  if (document.fullscreenElement) { document.exitFullscreen(); return; }
  if (player.requestFullscreen) player.requestFullscreen().catch(() => {});
  else if (video.webkitEnterFullscreen) { if (inIntro()) loadClip(current + 1, true); video.webkitEnterFullscreen(); }
});
document.addEventListener('fullscreenchange', () => fsBtn.setAttribute('aria-label', document.fullscreenElement ? 'Exit full screen' : 'Full screen'));
document.getElementById('back').addEventListener('click', () => {
  // Within the first 2 seconds, go to the previous clip; otherwise restart this one
  const t = inIntro() ? introElapsed : video.currentTime;
  const wasPlaying = inIntro() ? !!introTimer : !video.paused;
  if (t > 2) { if (inIntro()) { introElapsed = 0; } else { video.currentTime = 0; } }
  else loadClip(current - 1, wasPlaying || player.classList.contains('started'));
});
document.getElementById('fwd').addEventListener('click', () => loadClip(current + 1, true));
video.addEventListener('ended', () => {
  if (current < clips.length - 1) loadClip(current + 1, true);
  else player.classList.remove('playing');   // end of reel: show the info card again
});
loadClip(0, false);
player.querySelector('.progress').addEventListener('click', e => {
  const r = e.currentTarget.getBoundingClientRect();
  const frac = (e.clientX - r.left) / r.width;
  if (inIntro()) { introElapsed = frac * INTRO_SECONDS; bar.style.width = (frac * 100) + '%'; return; }
  if (video.duration) video.currentTime = frac * video.duration;
});
video.addEventListener('play', () => { player.classList.add('playing', 'started'); playBtn.innerHTML = PAUSE_ICON; playBtn.setAttribute('aria-label', 'Pause'); });
video.addEventListener('pause', () => { player.classList.remove('playing'); playBtn.innerHTML = PLAY_ICON; playBtn.setAttribute('aria-label', 'Play'); });
video.addEventListener('loadedmetadata', () => { document.getElementById('time-end').textContent = fmt(video.duration); });
video.addEventListener('timeupdate', () => {
  document.getElementById('time-cur').textContent = fmt(video.currentTime);
  bar.style.width = (video.duration ? video.currentTime / video.duration * 100 : 0) + '%';
});
// Click anywhere on the player (outside the control bar) to play/pause
player.querySelector('.controls').addEventListener('click', e => e.stopPropagation());
player.addEventListener('click', togglePlay);

// 2026–27 Seneca Valley varsity schedule (from Bound). result: 'W 9-2' / 'L 0-1' / 'T 2-2', or a start time for
// scrimmages and games not played yet. conf: true = conference game. Add new games here as the season goes on.
const games = [
  { date: 'Fri 8/28',  ha: 'vs', opp: 'Altoona', result: 'W 9-2', note: 'Quad Tournament' },
  { date: 'Sat 8/29',  ha: 'vs', opp: 'Cumberland Valley', result: 'T 2-2', note: 'Quad Tournament' },
  { date: 'Mon 8/31',  ha: '@',  opp: 'Norwin', result: 'T 0-0' },
  { date: 'Wed 9/2',   ha: 'vs', opp: 'Canon-McMillan', result: 'W 2-0' },
  { date: 'Wed 9/9',   ha: '@',  opp: 'Pine Richland', result: 'W 2-0', conf: true },
  { date: 'Thu 9/10',  ha: 'vs', opp: 'Allderdice', result: 'W 3-0' },
  { date: 'Mon 9/14',  ha: 'vs', opp: 'North Allegheny', result: 'L 0-1', conf: true },
  { date: 'Wed 9/16',  ha: '@',  opp: 'North Hills', result: 'W 4-0', conf: true },
  { date: 'Wed 9/23',  ha: 'vs', opp: 'Butler Area', result: 'W 1-0', conf: true },
  { date: 'Mon 9/28',  ha: 'vs', opp: 'Fox Chapel Area', result: 'T 1-1' },
  { date: 'Wed 9/30',  ha: 'vs', opp: 'Pine Richland', result: 'W 1-0', conf: true },
  { date: 'Mon 10/5',  ha: '@',  opp: 'North Allegheny', result: 'L 0-1', conf: true },
  { date: 'Wed 10/7',  ha: 'vs', opp: 'North Hills', result: 'W 3-0', conf: true },
  { date: 'Mon 10/12', ha: '@',  opp: 'Franklin Regional', result: 'W 3-1' },
  { date: 'Wed 10/14', ha: '@',  opp: 'Butler Area', result: 'W 3-1', conf: true },
  { date: 'Sat 10/17', ha: 'vs', opp: 'Fort LeBoeuf', result: 'W 4-0' },
  { date: 'Sat 10/24', ha: 'vs', opp: 'Gateway', result: 'W 6-0', note: 'WPIAL First Round' },
  { date: 'Wed 10/28', ha: '@',  opp: 'Fox Chapel Area', result: 'L 1-3', note: 'WPIAL Quarterfinal' },
];
const gamesList = document.getElementById('games-list');
const tally = { all: { W: 0, L: 0, T: 0 }, conf: { W: 0, L: 0, T: 0 } };
games.forEach(g => {
  const outcome = /^[WLT] /.test(g.result) ? g.result[0] : null; // null = scrimmage / not played yet
  if (outcome && g.note !== 'Scrimmage') { tally.all[outcome]++; if (g.conf) tally.conf[outcome]++; }
  const row = document.createElement('div');
  row.className = 'game';
  const [day, md] = g.date.split(' ');
  const tags = (g.note ? `<span class="tag">${g.note}</span>` : '') + (g.conf ? '<span class="tag conf" title="Conference game">Conf.</span>' : '');
  row.innerHTML = `<span class="when">${day} <b>${md}</b></span>
    <div class="opp"><i>${g.ha}</i>${g.opp}${tags}</div>
    <span class="res ${outcome ? outcome.toLowerCase() : 'upcoming'}">${g.result.replace('-', '–')}</span>`;
  gamesList.appendChild(row);
});
const rec = t => `${t.W}-${t.L}-${t.T}`;
document.getElementById('record').innerHTML =
  `<div><b>${rec(tally.all)}</b><span>Overall (W-L-T)</span></div><div><b>${rec(tally.conf)}</b><span>Conference</span></div>`;
