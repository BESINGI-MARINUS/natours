import { signup, login, logout } from './login';
import { updateSettings } from './updateSettings';

// ELEMENTS
const signupForm = document.getElementById('signup-form');
const loginForm = document.querySelector('#form');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const passwdUpdateForm = document.querySelector('.form-user-password');

if (signupForm) {
  signupForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('confirm-password').value;

    await signup({ name, email, password, passwordConfirm });
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (updateForm)
  updateForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const form = new FormData();
    form.append('name', updateForm.querySelector('#name').value);
    form.append('email', updateForm.querySelector('#email').value);
    form.append('photo', updateForm.querySelector('#photo').files[0]);

    updateSettings(form, 'data');
  });

if (passwdUpdateForm)
  passwdUpdateForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    document.querySelector('.change-passwd-btn').textContent = 'Updating...';

    const passwordPrevious =
      passwdUpdateForm.querySelector('#password-current').value;
    const password = passwdUpdateForm.querySelector('#password').value;
    const passwordConfirm =
      passwdUpdateForm.querySelector('#password-confirm').value;

    await updateSettings(
      { passwordPrevious, password, passwordConfirm },
      'password',
    );

    passwdUpdateForm.querySelector('#password-current').value = '';
    passwdUpdateForm.querySelector('#password').value = '';
    passwdUpdateForm.querySelector('#password-confirm').value = '';

    document.querySelector('.change-passwd-btn').textContent = 'save password';
  });
