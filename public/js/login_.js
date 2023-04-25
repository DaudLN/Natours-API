function alertMessage(icon, message) {
  // eslint-disable-next-line no-undef
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      // eslint-disable-next-line no-undef
      toast.addEventListener('mouseenter', Swal.stopTimer);
      // eslint-disable-next-line no-undef
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
  });

  Toast.fire({
    icon: icon,
    title: message,
  });
}

/* eslint-disable*/
const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: { email, password },
    });
    alertMessage('success', 'login success');
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
