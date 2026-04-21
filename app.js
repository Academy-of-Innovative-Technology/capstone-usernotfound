document.addEventListener('DOMContentLoaded', function () {
  // If not logged in, redirect to the login page
  const savedUser = (() => { try { return JSON.parse(sessionStorage.getItem('user')); } catch (e) { return null; }})();
  if (!savedUser || !savedUser.username) {
    // Avoid redirecting when already on the login page
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
      return;
    }
  }

  if (document.querySelectorAll('.cards .card').length) {
    document.querySelectorAll('.cards .card').forEach(function (card) {
      const btn = card.querySelector('button');
      const title = card.querySelector('h3')?.innerText || '';
      const info = card.querySelector('p')?.innerText || '';
  const imgEl = card.querySelector('img.card-img');
  const img = imgEl ? imgEl.getAttribute('src') : '';
  const description = card.dataset && card.dataset.description ? card.dataset.description : '';

      btn.addEventListener('click', function () {
  const payload = { title: title, info: info, img: img, description: description };
        try {
          sessionStorage.setItem('selectedItem', JSON.stringify(payload));
        } catch (e) {
          // sessionStorage may be unavailable; fallback to query string
          const url = new URL(window.location.href);
          url.pathname = 'details.html';
          url.searchParams.set('title', title);
          url.searchParams.set('info', info);
          url.searchParams.set('img', img);
          url.searchParams.set('description', description);
          window.location.href = url.toString();
          return;
        }

        window.location.href = 'details.html';
      });
    });
  }

  if (document.getElementById('details-card')) {
    let data = null;
    try {
      const raw = sessionStorage.getItem('selectedItem');
      if (raw) data = JSON.parse(raw);
    } catch (e) {
      data = null;
    }

    if (!data) {
      const params = new URLSearchParams(window.location.search);
      if (params.has('title') || params.has('info') || params.has('description')) {
        data = {
          title: params.get('title') || '',
          info: params.get('info') || '',
          description: params.get('description') || ''
        };
      }
    }

  const titleEl = document.getElementById('details-title');
  const infoEl = document.getElementById('details-info');
  const imgEl = document.getElementById('details-img');
  const descEl = document.getElementById('details-description');

    if (data) {
      titleEl.innerText = data.title || 'No title';
      infoEl.innerText = data.info || 'No additional information.';
      if (data.img) {
        imgEl.src = data.img;
        imgEl.alt = data.title || 'Image';
        imgEl.style.display = 'block';
      } else {
        imgEl.style.display = 'none';
      }
      descEl.innerText = data.description || '';
    } else {
      titleEl.innerText = 'No selection';
      infoEl.innerText = 'Please go back and choose an item.';
      imgEl.style.display = 'none';
      descEl.innerText = '';
    }
  }
});




// Initialize Mapbox map if possible
document.addEventListener('DOMContentLoaded', function () {
  try {
    if (typeof mapboxgl === 'undefined') {
      console.warn('mapboxgl is not loaded — Mapbox script missing or failed to load.');
      return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.warn('Map container element with id "map" not found.');
      return;
    }

    const MAPBOX_ACCESS_TOKEN = config.MAPBOX_KEY;

    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9
    });

    // Optional: add navigation controls
    map.addControl(new mapboxgl.NavigationControl());
  } catch (e) {
    console.error('Error initializing Mapbox map:', e);
  }
});

