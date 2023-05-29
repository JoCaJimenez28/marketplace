const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

function backdropClickHandler() {
  backdrop.style.display = 'none';
  sideDrawer.classList.remove('open');
}

function menuToggleClickHandler() {
  backdrop.style.display = 'block';
  sideDrawer.classList.add('open');
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);


let inputBox = document.querySelector(".input-box"), 
    searchIcon = document.querySelector(".icon"),
    closeIcon = document.querySelector(".close-icon");

searchIcon.addEventListener("click", () => inputBox.classList.add("open"));

closeIcon.addEventListener("click", () => inputBox.classList.remove("open"));

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(function(registration) {
      console.log('Service Worker registrado con éxito:', registration);
    })
    .catch(function(error) {
      console.log('Error al registrar el Service Worker:', error);
    });
}