/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (data) => {
  try {
    const res = await axios.post('/api/v1/users/signup', data);
    console.log(res);

    if (res.data.emailError) {
      showAlert(
        'success',
        `✅Account created successfully.\n❌${res.data.emailError}`,
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    } else if (res.data.status === 'success') {
      showAlert(
        'success',
        'Account created successfully.\nPlease check your email or Email spam',
      );
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('/api/v1/users/logout');
    if (res.data.status === 'success') {
      showAlert('success', 'Successfully logged out!');
      window.setTimeout(() => {
        // location.reload(true); //This is to reload thesame page from the server.
        location.assign('/login');
      }, 3000);
    }
  } catch (err) {
    showAlert('error', 'Unable to logout. Please try again!');
  }
};
