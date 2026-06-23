const fs = require('fs');

// 1. Update index.html with IDs
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('<h1 class="greeting-name">Marie</h1>', '<h1 class="greeting-name" id="home-greeting-name">Marie</h1>');

html = html.replace(
  '<div class="avatar-circle" style="background-image: url(\'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face\'); background-size: cover; background-position: center; color: transparent;">M</div>',
  '<div class="avatar-circle" id="home-avatar-img" style="background-image: url(\'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face\'); background-size: cover; background-position: center; color: transparent;">M</div>'
);

html = html.replace(
  '<div class="profile-avatar" style="background-image: url(\'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face\'); background-size: cover; background-position: center; color: transparent;">M</div>',
  '<div class="profile-avatar" id="profile-avatar-img" style="background-image: url(\'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face\'); background-size: cover; background-position: center; color: transparent;">M</div>'
);

html = html.replace('<h2>Marie Dupont</h2>', '<h2 id="profile-name">Marie Dupont</h2>');

html = html.replace('<p>Paris, 75011   Membre depuis Jan 2026</p>', '<p>Paris, 75011 • <span id="profile-age-display">28</span> ans • Membre depuis Jan 2026</p>');

fs.writeFileSync('index.html', html, 'utf8');

// 2. Update app.js function completeSignup
let js = fs.readFileSync('app.js', 'utf8');

const newCompleteSignup = `function completeSignup() {
  const firstname = document.getElementById('signup-firstname').value.trim() || 'Lucas';
  const lastname = document.getElementById('signup-lastname').value.trim() || 'Martin';
  const age = document.getElementById('signup-age').value.trim() || '28';
  
  if (!document.getElementById('signup-firstname').value.trim()) {
    alert("Veuillez entrer votre prénom.");
    return;
  }
  
  // Get selected avatar
  const avatarRadio = document.querySelector('input[name="avatar"]:checked');
  let avatarSrc = 'mascotte/tigresse detouré.png';
  if (avatarRadio && avatarRadio.value === 'tigrou') {
    avatarSrc = 'mascotte/tigrou3).png';
  }
  
  // Save to state
  state.user = {
    firstname: firstname,
    lastname: lastname,
    age: age,
    avatar: avatarSrc
  };
  
  // Update UI
  const homeName = document.getElementById('home-greeting-name');
  if (homeName) homeName.textContent = firstname;
  
  const profileName = document.getElementById('profile-name');
  if (profileName) profileName.textContent = firstname + ' ' + lastname;
  
  const profileAge = document.getElementById('profile-age-display');
  if (profileAge) profileAge.textContent = age;
  
  const homeAvatar = document.getElementById('home-avatar-img');
  if (homeAvatar) {
    homeAvatar.style.backgroundImage = 'url("' + avatarSrc + '")';
    homeAvatar.style.backgroundColor = 'var(--bg-surface)';
    homeAvatar.innerHTML = '';
  }
  
  const profileAvatar = document.getElementById('profile-avatar-img');
  if (profileAvatar) {
    profileAvatar.style.backgroundImage = 'url("' + avatarSrc + '")';
    profileAvatar.style.backgroundColor = 'var(--bg-surface)';
    profileAvatar.innerHTML = '';
  }
  
  const signup = document.getElementById('screen-signup');
  signup.classList.add('exiting');
  setTimeout(() => {
    signup.classList.remove('active');
    signup.classList.remove('exiting');
  }, 350);

  const onboarding = document.getElementById('screen-onboarding');
  onboarding.classList.add('active');
  state.currentScreen = 'onboarding';
}`;

const regex = /function completeSignup\(\) \{[\s\S]*?state\.currentScreen = 'onboarding';\n\}/;
js = js.replace(regex, newCompleteSignup);

fs.writeFileSync('app.js', js, 'utf8');
console.log("Updated avatars and info successfully");
