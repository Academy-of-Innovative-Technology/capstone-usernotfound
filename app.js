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
    fetch("YOUR_API_URL_HERE")
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

    // ---------------- USE CURRENT LOCATION ----------------
  // Adds a "Use my location" button, centers map on user, shows user marker,
  // computes distances to loaded spots and renders a small "Nearest" panel.
  (function addUseCurrentLocation() {
    // guard: require a map instance and a global spot list (set when loading API)
    const navbar = document.querySelector('.container.navbar') || document.querySelector('.navbar');
    if (!navbar) return;

    // add button to UI
    let locateBtn = document.getElementById('locate-btn');
    if (!locateBtn) {
      locateBtn = document.createElement('button');
      locateBtn.id = 'locate-btn';
      locateBtn.type = 'button';
      locateBtn.textContent = 'Use my location';
      locateBtn.className = 'btn-secondary';
      locateBtn.style.marginLeft = '12px';
      navbar.appendChild(locateBtn);
    }

    // create nearby panel
    let nearbyPanel = document.getElementById('nearby-panel');
    if (!nearbyPanel) {
      nearbyPanel = document.createElement('div');
      nearbyPanel.id = 'nearby-panel';
      nearbyPanel.style.position = 'fixed';
      nearbyPanel.style.right = '18px';
      nearbyPanel.style.top = '88px';
      nearbyPanel.style.width = '320px';
      nearbyPanel.style.maxHeight = '60vh';
      nearbyPanel.style.overflow = 'auto';
      nearbyPanel.style.background = 'rgba(255,255,255,0.98)';
      nearbyPanel.style.boxShadow = '0 10px 30px rgba(2,6,23,0.08)';
      nearbyPanel.style.borderRadius = '12px';
      nearbyPanel.style.padding = '12px';
      nearbyPanel.style.zIndex = '1400';
      nearbyPanel.style.display = 'none';
      nearbyPanel.setAttribute('aria-live','polite');
      document.body.appendChild(nearbyPanel);
    }

    // small helpers
    function toRad(v){ return v * Math.PI / 180; }
    function haversine([lng1, lat1], [lng2, lat2]) {
      // returns meters
      const R = 6371000;
      const φ1 = toRad(lat1), φ2 = toRad(lat2);
      const Δφ = toRad(lat2 - lat1), Δλ = toRad(lng2 - lng1);
      const a = Math.sin(Δφ/2)*Math.sin(Δφ/2) + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)*Math.sin(Δλ/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    // user marker + bubble
    let userMarker = null;

    function showUserMarker(coords) {
      if (typeof map === 'undefined' || !map) return;
      // remove previous
      if (userMarker) {
        try { userMarker.remove(); } catch(e){}
        userMarker = null;
      }
      const el = document.createElement('div');
      el.style.width = '18px';
      el.style.height = '18px';
      el.style.borderRadius = '50%';
      el.style.background = '#1e90ff';
      el.style.boxShadow = '0 3px 10px rgba(30,144,255,0.3)';
      userMarker = new mapboxgl.Marker(el).setLngLat(coords).addTo(map);
    }

    function formatDistance(m) {
      if (m >= 1000) return (m/1000).toFixed(1) + ' km';
      return Math.round(m) + ' m';
    }

    function renderNearbyList(userCoords, spots) {
      if (!Array.isArray(spots) || !spots.length) {
        nearbyPanel.innerHTML = '<div style="color:#64748b">No nearby spots available.</div>';
        nearbyPanel.style.display = 'block';
        return;
      }
      // compute distances
      const enriched = spots.map(s => {
        const dist = haversine(userCoords, [s.coords[0], s.coords[1]]);
        return Object.assign({}, s, { distance: dist });
      }).sort((a,b) => a.distance - b.distance);

      const top = enriched.slice(0, 6);
      nearbyPanel.innerHTML = '<strong style="display:block;margin-bottom:8px">Nearest restrooms</strong>';
      top.forEach(s => {
        const row = document.createElement('div');
        row.style.padding = '8px 6px';
        row.style.borderBottom = '1px solid rgba(11,91,255,0.04)';
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';

        const left = document.createElement('div');
        left.style.flex = '1 1 auto';
        left.innerHTML = `<div style="font-weight:700">${s.title}</div><div style="font-size:13px;color:#64748b">${s.rating} • ${formatDistance(s.distance)}</div>`;

        const btns = document.createElement('div');
        btns.style.display = 'flex';
        btns.style.gap = '8px';
        const view = document.createElement('button');
        view.className = 'btn-primary';
        view.textContent = 'View';
        view.onclick = () => {
          // center map and open popup if marker exists
          if (typeof map !== 'undefined' && map) {
            map.flyTo({ center: [s.coords[0], s.coords[1]], zoom: 15 });
            // try open popup by creating temporary popup
            new mapboxgl.Popup({ offset: 12 })
              .setLngLat([s.coords[0], s.coords[1]])
              .setHTML(`<strong>${s.title}</strong><div style="font-size:13px;margin-top:6px">${s.description||''}</div>`)
              .addTo(map);
          }
        };
        const dir = document.createElement('button');
        dir.className = 'btn-secondary';
        dir.textContent = 'Directions';
        dir.onclick = () => {
          const q = encodeURIComponent((s.title || '') + ' ' + (s.description || ''));
          window.open('https://www.google.com/maps/dir/?api=1&destination=' + q, '_blank');
        };

        btns.appendChild(view);
        btns.appendChild(dir);

        row.appendChild(left);
        row.appendChild(btns);
        nearbyPanel.appendChild(row);
      });
      nearbyPanel.style.display = 'block';
    }

    function useCurrentLocation() {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        alert('Geolocation not available in this browser.');
        return;
      }
      locateBtn.disabled = true;
      locateBtn.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(function(pos) {
        locateBtn.disabled = false;
        locateBtn.textContent = 'Use my location';
        const userCoords = [pos.coords.longitude, pos.coords.latitude];
        // show marker and center map
        try { showUserMarker(userCoords); } catch(e){}
        try { map.flyTo({ center: userCoords, zoom: 14 }); } catch(e){}

        // get the currently loaded spots
        const allSpots = window.__allSpots || window.__spots || [];
        if (allSpots && allSpots.length) {
          renderNearbyList(userCoords, allSpots);
        } else {
          // try to collect markers from page (if renderSpots created markers)
          // fallback: call renderNearbyList with popular fallback (if defined)
          const fallback = window.__popularSpots || [];
          renderNearbyList(userCoords, fallback);
        }
      }, function(err) {
        locateBtn.disabled = false;
        locateBtn.textContent = 'Use my location';
        console.warn('geolocation error', err);
        alert('Could not get your location: ' + (err.message || 'Permission denied or unavailable'));
      }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
    }

    locateBtn.addEventListener('click', useCurrentLocation);

    // expose for console/testing
    window.useCurrentLocation = useCurrentLocation;
  })();
});
