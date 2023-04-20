/* eslint-disable*/
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });
    console.log(res.data.token);
  } catch (err) {
    console.log(err.response.data.message);
  }
};

$(document).ready(() => {
  $('.form').on('submit', (e) => {
    e.preventDefault();
    login($('#email').val(), $('#password').val());
  });
});
