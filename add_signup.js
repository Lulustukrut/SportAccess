const fs = require('fs');

// 1. Modify HTML
let html = fs.readFileSync('index.html', 'utf8');

const signupHTML = `
    <!-- Signup Screen -->
    <div id="screen-signup" class="screen">
      <div class="screen-scroll" style="display: flex; flex-direction: column; justify-content: center; min-height: 100vh; padding: 24px;">
        <div class="signup-header" style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-family: 'Sora', sans-serif; font-size: 1.8rem; font-weight: 700; margin-bottom: 8px;">Créez votre profil</h1>
          <p style="color: var(--text-secondary); font-size: 0.95rem;">Personnalisez votre expérience SportAccess</p>
        </div>
        
        <form id="signup-form" class="signup-form">
          <div class="input-group" style="margin-bottom: 16px;">
            <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 500;">Prénom</label>
            <input type="text" id="signup-firstname" placeholder="Ex: Lucas" required style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); color: var(--text); outline: none; transition: border-color 0.2s;">
          </div>
          <div class="input-group" style="margin-bottom: 16px;">
            <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 500;">Nom</label>
            <input type="text" id="signup-lastname" placeholder="Ex: Martin" required style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); color: var(--text); outline: none; transition: border-color 0.2s;">
          </div>
          <div class="input-group" style="margin-bottom: 24px;">
            <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px; font-weight: 500;">Âge</label>
            <input type="number" id="signup-age" placeholder="Ex: 28" required style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); color: var(--text); outline: none; transition: border-color 0.2s;">
          </div>
          
          <div class="avatar-selection" style="margin-bottom: 32px;">
            <label style="display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px; font-weight: 500; text-align: center;">Choisissez votre avatar</label>
            <div class="avatar-grid" style="display: flex; gap: 20px; justify-content: center;">
              
              <label class="avatar-option">
                <input type="radio" name="avatar" value="tigresse" checked style="display: none;">
                <div class="avatar-img-container">
                  <img src="mascotte/tigresse detouré.png" alt="Tigresse">
                </div>
              </label>

              <label class="avatar-option">
                <input type="radio" name="avatar" value="tigrou" style="display: none;">
                <div class="avatar-img-container">
                  <img src="mascotte/tigrou3).png" alt="Tigrou">
                </div>
              </label>

            </div>
          </div>

          <button type="button" class="btn-primary btn-full" onclick="completeSignup()" style="padding: 16px; border-radius: 16px; font-size: 1rem; font-weight: 600;">Continuer</button>
        </form>
      </div>
    </div>
`;

if (!html.includes('id="screen-signup"')) {
  html = html.replace('<!-- Onboarding Screen -->', signupHTML + '\n    <!-- Onboarding Screen -->');
  fs.writeFileSync('index.html', html, 'utf8');
}

// 2. Modify JS
let js = fs.readFileSync('app.js', 'utf8');
if (!js.includes('function completeSignup')) {
  // change splash to transition to signup
  js = js.replace(`const onboarding = document.getElementById('screen-onboarding');
    onboarding.classList.add('active');
    state.currentScreen = 'onboarding';`, `const signup = document.getElementById('screen-signup');
    signup.classList.add('active');
    state.currentScreen = 'signup';`);
    
  // add completeSignup function
  js += `\n
function completeSignup() {
  const firstname = document.getElementById('signup-firstname').value.trim();
  const lastname = document.getElementById('signup-lastname').value.trim();
  const age = document.getElementById('signup-age').value.trim();
  
  if (!firstname) {
    alert("Veuillez entrer votre prénom.");
    return;
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
}
`;
  fs.writeFileSync('app.js', js, 'utf8');
}

// 3. Modify CSS
let css = fs.readFileSync('styles.css', 'utf8');
if (!css.includes('.avatar-option')) {
  const newCss = `
/* --- Signup --- */
.avatar-option {
  cursor: pointer;
}
.avatar-option input:checked + .avatar-img-container {
  border-color: var(--primary);
  background: rgba(186, 255, 41, 0.1);
  transform: scale(1.05);
}
.avatar-img-container {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--bg-surface);
  overflow: hidden;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.signup-form input:focus {
  border-color: var(--primary);
  background: rgba(255,255,255,0.06);
}
`;
  css += newCss;
  fs.writeFileSync('styles.css', css, 'utf8');
}

console.log("Signup screen successfully integrated.");
