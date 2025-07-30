// Wishlist (favorite cars)
document.addEventListener('DOMContentLoaded', function() {
  document.querySelectorAll('.wishlist-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const carId = this.dataset.carId;
      let favs = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (favs.includes(carId)) {
        favs = favs.filter(id => id !== carId);
        this.classList.remove('text-danger');
      } else {
        favs.push(carId);
        this.classList.add('text-danger');
      }
      localStorage.setItem('wishlist', JSON.stringify(favs));
      showToast('Wishlist updated!');
    });
  });

  // Autosuggest for search bar
  const searchInput = document.querySelector('input[name="q"]');
  if (searchInput) {
    searchInput.addEventListener('input', function() {
      const val = this.value.toLowerCase();
      fetch('/cars?q=' + encodeURIComponent(val))
        .then(res => res.text())
        .then(html => {
          // Simple parse: extract car names from HTML
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const cars = Array.from(doc.querySelectorAll('.card-title')).map(e => e.textContent);
          let list = document.getElementById('autosuggest-list');
          if (!list) {
            list = document.createElement('div');
            list.id = 'autosuggest-list';
            list.className = 'list-group position-absolute w-100';
            searchInput.parentNode.appendChild(list);
          }
          list.innerHTML = '';
          cars.slice(0,5).forEach(car => {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = 'list-group-item list-group-item-action';
            item.textContent = car;
            item.onclick = () => { searchInput.value = car; list.innerHTML = ''; };
            list.appendChild(item);
          });
        });
    });
    document.addEventListener('click', function(e) {
      if (!searchInput.contains(e.target)) {
        const list = document.getElementById('autosuggest-list');
        if (list) list.innerHTML = '';
      }
    });
  }

  // Lightbox gallery
  document.querySelectorAll('.gallery-thumb').forEach(img => {
    img.addEventListener('click', function() {
      const src = this.src;
      const modal = document.getElementById('lightboxModal');
      modal.querySelector('img').src = src;
      new bootstrap.Modal(modal).show();
    });
  });
});

// Spinner and transitions
function showSpinner() {
  document.getElementById('global-spinner').style.display = 'block';
}
function hideSpinner() {
  document.getElementById('global-spinner').style.display = 'none';
}
document.addEventListener('DOMContentLoaded', function() {
  hideSpinner();
  document.body.classList.add('fade-in');
});
window.addEventListener('beforeunload', function() {
  showSpinner();
});

// Toast
function showToast(msg) {
  let toast = document.getElementById('main-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'main-toast';
    toast.className = 'toast align-items-center text-bg-primary border-0 position-fixed bottom-0 end-0 m-3';
    toast.innerHTML = '<div class="d-flex"><div class="toast-body"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>';
    document.body.appendChild(toast);
  }
  toast.querySelector('.toast-body').textContent = msg;
  new bootstrap.Toast(toast).show();
}

// Geolocation: find nearest rental location
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
window.showNearestLocation = function(locations) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(pos) {
      const userLat = pos.coords.latitude;
      const userLon = pos.coords.longitude;
      let minDist = Infinity, nearest = null;
      locations.forEach(loc => {
        if (loc.lat && loc.lon) {
          const dist = getDistance(userLat, userLon, loc.lat, loc.lon);
          if (dist < minDist) { minDist = dist; nearest = loc; }
        }
      });
      if (nearest) {
        document.getElementById('nearest-location').textContent = `Nearest: ${nearest.name} (${minDist.toFixed(1)} km)`;
      }
    });
  }
};
// Light/Dark mode toggle
window.toggleTheme = function() {
  const html = document.documentElement;
  if (html.classList.contains('dark')) {
    html.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  } else {
    html.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }
};
document.addEventListener('DOMContentLoaded', function() {
  if (localStorage.getItem('theme') === 'dark') {
    document.documentElement.classList.add('dark');
  }
});
// Social sharing (car detail)
window.shareCar = function(url) {
  if (navigator.share) {
    navigator.share({ url });
  } else {
    navigator.clipboard.writeText(url);
    showToast('Link copied!');
  }
};

document.getElementById('chat-form').onsubmit = async function(e) {
  e.preventDefault();
  var input = document.getElementById('chat-input');
  var msg = input.value.trim();
  if (msg) {
    var chatMessages = document.getElementById('chat-messages');
    var userMsg = document.createElement('div');
    userMsg.className = 'mb-2 text-end';
    userMsg.innerHTML = '<span class="badge bg-primary">' + msg + '</span>';
    chatMessages.appendChild(userMsg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    input.value = '';
    // Send to AI backend
    try {
      var res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      var data = await res.json();
      var botMsg = document.createElement('div');
      botMsg.className = 'mb-2 text-start';
      botMsg.innerHTML = '<span class="badge bg-secondary">' + (data.reply || 'Sorry, AI is unavailable.') + '</span>';
      chatMessages.appendChild(botMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (err) {
      var botMsg = document.createElement('div');
      botMsg.className = 'mb-2 text-start';
      botMsg.innerHTML = '<span class="badge bg-danger">AI error. Please try again later.</span>';
      chatMessages.appendChild(botMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }
}; 