/*eslint-disable*/
document.addEventListener('DOMContentLoaded', () => {
  const locations = JSON.parse(
    document.querySelector('#map').dataset.locations
  );
  console.log(locations);
});
