import { login, logout } from './login';
import { updateSettings } from './updateSettings';

// ELEMENTS
const loginForm = document.querySelector('#form');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateForm = document.querySelector('.form-user-data');
const passwdUpdateForm = document.querySelector('.form-user-password');

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
    const name = updateForm.querySelector('#name').value;
    const email = updateForm.querySelector('#email').value;

    updateSettings({ name, email }, 'data');
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

// "passwordPrevious":"test-1234",
//   "password":"test-123",
//   "passwordConfirm":"test-1234"
