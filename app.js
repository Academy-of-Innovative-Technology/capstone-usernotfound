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

// ...existing code...
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
      if (titleEl) titleEl.innerText = data.title || 'No title';
      if (infoEl) infoEl.innerText = data.info || 'No additional information.';
      if (imgEl) {
        if (data.img) {
          imgEl.src = data.img;
          imgEl.alt = data.title || 'Image';
          imgEl.style.display = 'block';
        } else {
          imgEl.style.display = 'none';
        }
      }
      if (descEl) descEl.innerText = data.description || '';
    } else {
      if (titleEl) titleEl.innerText = 'No selection';
      if (infoEl) infoEl.innerText = 'Please go back and choose an item.';
      if (imgEl) imgEl.style.display = 'none';
      if (descEl) descEl.innerText = '';
    }
  }

  // Initialize Mapbox map if possible
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

    const MAPBOX_ACCESS_TOKEN = (typeof config !== 'undefined' && config.MAPBOX_KEY) ? config.MAPBOX_KEY : null;
    if (!MAPBOX_ACCESS_TOKEN) {
      console.warn('Mapbox access token not available (config.MAPBOX_KEY).');
      return;
    }

    mapboxgl.accessToken = 'pk.eyJ1IjoibmluamFhLXR1cnRsZXMiLCJhIjoiY204cTRiMnRpMGozeTJqcHM1bzRsMGNkOSJ9.vmRXru11d2mcAlIx7Zvc7Q';

var mapProps = {
    container: 'map',
    center: [-73.97, 40.75],
    zoom: 9,
  
    style: 'mapbox://styles/mapbox/streets-v11'
};

var map = new mapboxgl.Map(mapProps);


map.addControl(new mapboxgl.NavigationControl());


var markerData = [
  { coords: [-73.97, 40.75], title: 'Center', description: 'Map center' },
  { coords: [-73.9851, 40.7589], title: 'Times Square', description: 'Busy square' },
  { coords: [-73.9772, 40.7527], title: 'Grand Central', description: 'Terminal' }
];

markerData.forEach(function(m) {
  var popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML('<strong>' + m.title + '</strong><p>' + m.description + '</p>');

  new mapboxgl.Marker()          
    .setLngLat(m.coords)
    .setPopup(popup)              
    .addTo(map);
});


map.on('click', function(e) {
  var clickedMarker = new mapboxgl.Marker({ color: '#FF0000' })
    .setLngLat(e.lngLat)
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setText('You clicked here'))
    .addTo(map);
});


    map.on('load', function () {
      map.resize();
    });

    map.addControl(new mapboxgl.NavigationControl());

    // Add markers for the four spots (approx coordinates)
    const spots = [
      { title: 'Astoria Park Restroom', coords: [-73.9227, 40.7794], rating: '⭐ 3.8' },
      { title: 'Gantry Plaza State Park Restroom', coords: [-73.9485, 40.7472], rating: '⭐ 4.8' },
      { title: 'Brooklyn Bridge Park Restroom', coords: [-73.9967, 40.7033], rating: '⭐ 4.8' },
      { title: 'Coney Island Boardwalk Restroom', coords: [-73.9850, 40.5749], rating: '⭐ 4.5' }
    ];

    spots.forEach(s => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '50%';
      el.style.background = '#0072ff';
      el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

      const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(
        `<strong>${s.title}</strong><div style="font-size:13px;margin-top:6px">${s.rating}</div>`
      );

      new mapboxgl.Marker(el)
        .setLngLat(s.coords)
        .setPopup(popup)
        .addTo(map);
    });

  } catch (e) {
    console.error('Error initializing Mapbox map:', e);
  }
});