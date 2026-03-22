const audio = new Audio();
let currentUrl = '';
let isMuted = false;
let currentVolume = 0.5;

function broadcastState() {
  chrome.runtime.sendMessage({
    type: 'RADIO_STATE',
    url: currentUrl,
    playing: !audio.paused && currentUrl !== '',
    volume: currentVolume,
    muted: isMuted
  }).catch(() => {});
}

audio.onplay = broadcastState;
audio.onpause = broadcastState;
audio.onended = () => {
  currentUrl = '';
  broadcastState();
};
audio.onerror = () => {
  currentUrl = '';
  broadcastState();
};
audio.onvolumechange = broadcastState;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'OFFSCREEN_COMMAND') {
    const p = msg.payload;
    if (p.action === 'play') {
      if (currentUrl !== p.url) {
        currentUrl = p.url;
        audio.src = p.url;
      }
      isMuted = p.muted ?? isMuted;
      currentVolume = p.volume ?? currentVolume;
      audio.volume = isMuted ? 0 : currentVolume;
      audio.play().catch(console.error);
    } else if (p.action === 'pause') {
      audio.pause();
    } else if (p.action === 'setVolume') {
      isMuted = p.muted;
      currentVolume = p.volume;
      audio.volume = isMuted ? 0 : currentVolume;
    } else if (p.action === 'getState') {
      broadcastState();
    }
  }
});
