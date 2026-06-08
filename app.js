document.addEventListener('DOMContentLoaded', function () {
  // ---------------- LOGIN CHECK ----------------
  const savedUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem('user'));
    } catch (e) {
      return null;
    }
  })();

  if (!savedUser || !savedUser.username) {
    if (!window.location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
      return;
    }
  }

  // ---------------- CARD CLICK LOGIC ----------------
  if (document.querySelectorAll('.cards .card').length) {
    document.querySelectorAll('.cards .card').forEach(function (card) {
      const btn = card.querySelector('button');
      const title = card.querySelector('h3')?.innerText || '';
      const info = card.querySelector('p')?.innerText || '';
      const imgEl = card.querySelector('img.card-img');
      const img = imgEl ? imgEl.getAttribute('src') : '';
      const description = card.dataset && card.dataset.description ? card.dataset.description : '';

      btn.addEventListener('click', function () {
        const payload = { title, info, img, description };

        try {
          sessionStorage.setItem('selectedItem', JSON.stringify(payload));
        } catch (e) {
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

  // ---------------- DETAILS PAGE LOGIC ----------------
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
      data = {
        title: params.get('title') || '',
        info: params.get('info') || '',
        description: params.get('description') || ''
      };
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
          imgEl.style.display = 'block';
        } else {
          imgEl.style.display = 'none';
        }
      }
      if (descEl) descEl.innerText = data.description || '';
    }
  }

  // ---------------- MAPBOX ----------------
  try {
    if (typeof mapboxgl === 'undefined') {
      console.warn('Mapbox not loaded');
      return;
    }

    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const token = (typeof config !== 'undefined') ? config.MAPBOX_KEY : null;
    if (!token) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-73.97, 40.75],
      zoom: 11
    });

    map.addControl(new mapboxgl.NavigationControl());

    // ---------------- API → SPOTS FORMAT ----------------
    fetch("api.json")
      .then(res => res.json())
      .then(json => {
        const spots = json.response.map(item => ({
          title: item.location?.name,
          coords: [
            item.coordinates?.longitude,
            item.coordinates?.latitude
          ],
          rating: item.profile?.wheelchairAccessible
            ? "⭐ Wheelchair Accessible"
            : "⭐ Standard Access",
          description: item.location?.address
        }));

        renderSpots(spots, map);
      })
      .catch(err => console.error("API error:", err));

    // ---------------- ORIGINAL STYLE MARKERS ----------------
    function renderSpots(spots, map) {
      spots.forEach(s => {
        const popup = new mapboxgl.Popup({ offset: 12 }).setHTML(`
          <strong>${s.title}</strong>
          <div style="font-size:13px;margin-top:6px">
            ${s.rating}<br/>
            ${s.description || ""}
          </div>
        `);

        const el = document.createElement('div');
        el.style.width = '18px';
        el.style.height = '18px';
        el.style.borderRadius = '50%';
        el.style.background = '#0072ff';
        el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';

        new mapboxgl.Marker(el)
          .setLngLat(s.coords)
          .setPopup(popup)
          .addTo(map);
      });
    }

  } catch (e) {
    console.error('Map error:', e);
  }
});
