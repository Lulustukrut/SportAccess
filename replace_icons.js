const fs = require('fs');

const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

// Add Phosphor Icons script if not present
if (!content.includes('unpkg.com/@phosphor-icons/web')) {
  content = content.replace(
    '</head>',
    '  <script src="https://unpkg.com/@phosphor-icons/web"></script>\n</head>'
  );
}

const replacements = {
  '👋': '<i class="ph ph-hand-waving"></i>',
  '🧘': '<i class="ph ph-person-simple-lotus"></i>',
  '🎾': '<i class="ph ph-tennis-ball"></i>',
  '🏊': '<i class="ph ph-swimmer"></i>',
  '🥊': '<i class="ph ph-boxing-glove"></i>',
  '⚽': '<i class="ph ph-soccer-ball"></i>',
  '🚴': '<i class="ph ph-bicycle"></i>',
  '👟': '<i class="ph ph-sneaker"></i>',
  '🎯': '<i class="ph ph-target"></i>',
  '♿': '<i class="ph-fill ph-wheelchair"></i>',
  '🏅': '<i class="ph-fill ph-medal"></i>',
  '🥇': '<i class="ph-fill ph-medal" style="color: #ffd700;"></i>',
  '🥈': '<i class="ph-fill ph-medal" style="color: #c0c0c0;"></i>',
  '🥉': '<i class="ph-fill ph-medal" style="color: #cd7f32;"></i>',
  '⭐': '<i class="ph-fill ph-star" style="color: var(--primary);"></i>',
  '📍': '<i class="ph-fill ph-map-pin"></i>',
  '🎓': '<i class="ph-fill ph-graduation-cap"></i>',
  '🆕': '<i class="ph-fill ph-sparkle"></i>',
  '💳': '<i class="ph ph-credit-card"></i>',
  '💶': '<i class="ph ph-money"></i>',
  '📅': '<i class="ph ph-calendar-blank"></i>',
  '💬': '<i class="ph-fill ph-chat-circle"></i>',
  '❤️': '<i class="ph-fill ph-heart"></i>',
  '🤍': '<i class="ph ph-heart"></i>',
  '🔥': '<i class="ph-fill ph-fire"></i>',
  '🎉': '<i class="ph-fill ph-confetti"></i>',
  '✨': '<i class="ph-fill ph-sparkle"></i>',
  '✅': '<i class="ph-fill ph-check-circle"></i>',
  '⏱️': '<i class="ph ph-timer"></i>',
  '⏳': '<i class="ph ph-hourglass"></i>',
  '💧': '<i class="ph-fill ph-drop"></i>',
  '🧠': '<i class="ph ph-brain"></i>',
  '💪': '<i class="ph-fill ph-barbell"></i>',
  '🔔': '<i class="ph-fill ph-bell"></i>',
  '🎟️': '<i class="ph ph-ticket"></i>',
  '🏋️': '<i class="ph-fill ph-barbell"></i>'
};

for (const [emoji, icon] of Object.entries(replacements)) {
  const regex = new RegExp(emoji, 'g');
  content = content.replace(regex, icon);
}

fs.writeFileSync(path, content, 'utf8');
console.log('Replaced emojis with Phosphor icons.');
