/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations);
const map = L.map('map').setView([34.0116172, -118.7323183], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
console.log(locations);
