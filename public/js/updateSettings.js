import axios from 'axios';
import { showAlert } from './alert';

// data could either be {name,email,photo}, or password reset details
export const updateSettings = async function (data, type) {
  const url =
    type === 'data' ? '/api/v1/users/updateMe' : 'api/v1/users/updatePassword';

  try {
    const res = await axios.patch(url, data);

    if (res.data.status === 'success')
      showAlert('success', `${type.toUpperCase()} Updated Successfully`);

    if (type === 'data')
      window.setTimeout(() => {
        location.reload(true);
      }, 2000);
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
