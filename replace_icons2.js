const fs = require('fs');

const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

const replacements = {
  '🤸': '<i class="ph ph-person"></i>',
  '⛳': '<i class="ph ph-flag-pennant"></i>',
  '🧗': '<i class="ph ph-mountains"></i>',
  '♡': '<i class="ph ph-heart"></i>',
  '★': '<i class="ph-fill ph-star" style="color: var(--primary);"></i>',
  '☆': '<i class="ph ph-star" style="color: var(--text-muted);"></i>',
  '🕐': '<i class="ph ph-clock"></i>',
  '👏': '<i class="ph ph-hands-clapping"></i>',
  '✕': '<i class="ph ph-x"></i>',
  '🏃': '<i class="ph ph-person-simple-run"></i>',
  '👨‍🏫': '<i class="ph ph-chalkboard-teacher"></i>',
  '👩‍🏫': '<i class="ph ph-chalkboard-teacher"></i>',
  '👨': '<i class="ph ph-user"></i>',
  '👩': '<i class="ph ph-user"></i>',
  '♀': '', // ignore zero-width joiner components if separated
  '☰': '<i class="ph ph-list"></i>',
  '🗺': '<i class="ph ph-map-trifold"></i>',
  '💰': '<i class="ph ph-coins"></i>',
  '👥': '<i class="ph ph-users"></i>',
  '🚿': '<i class="ph ph-shower"></i>',
  '🔒': '<i class="ph ph-lock-key"></i>',
  '🅿': '<i class="ph-fill ph-parking"></i>',
  '🌡': '<i class="ph ph-thermometer"></i>',
  '📶': '<i class="ph ph-wifi-high"></i>',
  '🌟': '<i class="ph-fill ph-star"></i>',
  '📊': '<i class="ph ph-chart-bar"></i>',
  '📱': '<i class="ph ph-device-mobile"></i>',
  '➕': '<i class="ph ph-plus"></i>',
  '👤': '<i class="ph ph-user"></i>',
  '🎁': '<i class="ph ph-gift"></i>',
  '🔟': '10',
  '♾': '<i class="ph ph-infinity"></i>',
  '🏆': '<i class="ph-fill ph-trophy"></i>',
  '😊': '<i class="ph ph-smiley"></i>',
  '🌙': '<i class="ph-fill ph-moon"></i>',
  '🌐': '<i class="ph ph-globe"></i>',
  '❓': '<i class="ph ph-question"></i>',
  '📝': '<i class="ph ph-note-pencil"></i>'
};

for (const [emoji, icon] of Object.entries(replacements)) {
  const regex = new RegExp(emoji, 'g');
  content = content.replace(regex, icon);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced remaining emojis with Phosphor icons.');
