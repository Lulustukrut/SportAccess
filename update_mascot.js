const fs = require('fs');

// 1. Modify app.js
let js = fs.readFileSync('app.js', 'utf8');
const oldCompleteSignup = `function completeSignup() {
  const firstname = document.getElementById('signup-firstname').value.trim();
  const lastname = document.getElementById('signup-lastname').value.trim();
  const age = document.getElementById('signup-age').value.trim();
  
  if (!firstname) {
    alert("Veuillez entrer votre prénom.");
    return;
  }`;

const newCompleteSignup = `function completeSignup() {
  const firstname = document.getElementById('signup-firstname').value.trim();
  const lastname = document.getElementById('signup-lastname').value.trim();
  const age = document.getElementById('signup-age').value.trim();
  
  if (!firstname) {
    alert("Veuillez entrer votre prénom.");
    return;
  }
  
  // Update Profile Info
  const greetingName = document.getElementById('home-greeting-name');
  if(greetingName) greetingName.textContent = firstname;
  
  const profileName = document.getElementById('profile-name');
  if(profileName) profileName.textContent = firstname + " " + lastname;
  
  // Avatar handling
  const avatarRadio = document.querySelector('input[name="avatar"]:checked');
  const avatarChoice = avatarRadio ? avatarRadio.value : 'tigresse';
  
  let avatarUrl = '';
  let homeMascotClass = '';
  if (avatarChoice === 'tigresse') {
    avatarUrl = 'mascotte/tigresse detouré.png';
    homeMascotClass = 'tigresse';
  } else {
    avatarUrl = 'mascotte/tigrou3).png';
    homeMascotClass = 'tigrou';
  }
  
  const homeAvatar = document.getElementById('home-avatar-img');
  if(homeAvatar) {
    homeAvatar.style.backgroundImage = \`url('\${avatarUrl}')\`;
    homeAvatar.textContent = '';
  }
  
  const profileAvatar = document.getElementById('profile-avatar-img');
  if(profileAvatar) {
    profileAvatar.style.backgroundImage = \`url('\${avatarUrl}')\`;
    profileAvatar.textContent = '';
  }
  
  const homeMascot = document.getElementById('home-mascot');
  if(homeMascot) {
    homeMascot.className = 'home-mascot ' + homeMascotClass;
  }
`;

if (js.includes(oldCompleteSignup) && !js.includes('// Update Profile Info')) {
  js = js.replace(oldCompleteSignup, newCompleteSignup);
  fs.writeFileSync('app.js', js, 'utf8');
}

// 2. Modify index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="home-mascot"')) {
  html = html.replace(
    '<div id="screen-home" class="screen">\n      <div class="screen-scroll">',
    '<div id="screen-home" class="screen">\n      <div class="screen-scroll">\n        <div id="home-mascot" class="home-mascot"></div>'
  );
  fs.writeFileSync('index.html', html, 'utf8');
}

// 3. Modify styles.css
let css = fs.readFileSync('styles.css', 'utf8');
if (!css.includes('.home-mascot')) {
  css += `\n
/* --- Home Mascot --- */
.home-mascot {
  position: absolute;
  top: 140px;
  width: 150px;
  height: 200px;
  background-size: contain;
  background-repeat: no-repeat;
  pointer-events: none;
  z-index: 5;
  opacity: 0.9;
}
.home-mascot.tigrou {
  left: -40px;
  background-image: url('mascotte/tigrou\\ 2.png');
}
.home-mascot.tigresse {
  right: -40px;
  background-image: url('mascotte/tigresse\\ 1.png');
}
`;
  fs.writeFileSync('styles.css', css, 'utf8');
}

console.log("Mascot updates injected!");
