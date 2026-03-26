// ===== APP LOGIC =====

const pageTitles = {
  home: 'Dashboard',
  order: 'New Order',
  track: 'Track Order',
  history: 'Order History',
  ai: 'AI Assistant',
  profile: 'My Profile'
};

// ---- NAVIGATION ----
function showPage(pageId, el) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const page = document.getElementById('page-' + pageId);
  if (page) page.classList.add('active');
  if (el) el.classList.add('active');
  document.getElementById('pageTitle').textContent = pageTitles[pageId] || pageId;
  // close sidebar on mobile
  if (window.innerWidth <= 768) closeSidebar();
  // load page specific data
  if (pageId === 'home') loadHomePage();
  if (pageId === 'track') loadRecentOrders();
  if (pageId === 'history') loadHistoryPage('all');
  if (pageId === 'profile') loadProfilePage();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}
function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
}

// ---- NOTIFICATIONS ----
function toggleNotif() {
  document.getElementById('notifPanel').classList.toggle('hidden');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.topbar-right')) {
    const p = document.getElementById('notifPanel');
    if (p) p.classList.add('hidden');
  }
});

// ---- TOAST ----
function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  setTimeout(() => t.classList.add('hidden'), duration);
}

// ---- STATUS HELPERS ----
function statusClass(status) {
  const m = { transit: 'status-transit', delivered: 'status-delivered', pending: 'status-pending', cancelled: 'status-cancelled' };
  return m[status] || '';
}
function statusLabel(status) {
  const m = { transit: '🚚 In Transit', delivered: '✅ Delivered', pending: '⏳ Pending', cancelled: '❌ Cancelled' };
  return m[status] || status;
}
function categoryIcon(cat) {
  const m = { Electronics: '💻', Clothing: '👗', 'Food & Grocery': '🛒', Documents: '📄', Furniture: '🛋️', Medical: '💊', Other: '📦' };
  return m[cat] || '📦';
}
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ---- HOME PAGE ----
function loadHomePage() {
  const orders = getOrders();
  const delivered = orders.filter(o => o.status === 'delivered').length;
  const transit = orders.filter(o => o.status === 'transit').length;

  animateNum('statTotal', orders.length);
  animateNum('statDelivered', delivered);
  animateNum('statActive', transit);

  const active = orders.filter(o => o.status === 'transit' || o.status === 'pending');
  const container = document.getElementById('activeDeliveriesList');
  if (active.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:0.88rem;padding:1rem 0;">No active deliveries right now.</div>';
  } else {
    container.innerHTML = active.map(renderDeliveryCard).join('');
  }
}

function animateNum(id, target) {
  const el = document.getElementById(id);
  if (!el || isNaN(target)) return;
  let start = 0;
  const step = Math.ceil(target / 30);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = start;
    if (start >= target) clearInterval(timer);
  }, 30);
}

function renderDeliveryCard(order) {
  return `
  <div class="delivery-card" onclick="quickTrack('${order.id}')">
    <div class="delivery-icon">${categoryIcon(order.category)}</div>
    <div class="delivery-info">
      <div class="delivery-id">${order.id} — ${order.pkgName}</div>
      <div class="delivery-desc">To: ${order.recipient} • ${order.to}</div>
    </div>
    <div class="delivery-meta">
      <div class="delivery-status ${statusClass(order.status)}">${statusLabel(order.status)}</div>
      <div class="delivery-time">Est: ${formatDate(order.estimatedDelivery)}</div>
    </div>
  </div>`;
}

function quickTrack(id) {
  showPage('track', document.querySelector('[data-page=track]'));
  setTimeout(() => {
    document.getElementById('trackInput').value = id;
    trackOrder();
  }, 100);
}

// ---- ORDER PAGE ----
function estimateOrder() {
  const name = document.getElementById('pkgName').value;
  const weight = parseFloat(document.getElementById('pkgWeight').value) || 1;
  const priority = document.getElementById('pkgPriority').value;
  const from = document.getElementById('pickupCity').value || 'origin';
  const to = document.getElementById('dropCity').value || 'destination';

  const basePrices = { standard: 50, express: 120, 'same-day': 250 };
  const base = basePrices[priority] || 50;
  const weightCost = weight * 15;
  const total = Math.round(base + weightCost);
  const distance = Math.round(Math.random() * 400 + 100);

  const days = { standard: '3-5 days', express: '1-2 days', 'same-day': 'Today' };

  const box = document.getElementById('estimateBox');
  const content = document.getElementById('estimateContent');
  content.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0.8rem;margin-top:0.5rem">
      <div><div style="font-size:0.75rem;color:var(--text-muted)">Estimated Cost</div><div style="font-weight:700;font-size:1.1rem;color:var(--accent)">₹${total}</div></div>
      <div><div style="font-size:0.75rem;color:var(--text-muted)">Distance</div><div style="font-weight:700">~${distance} km</div></div>
      <div><div style="font-size:0.75rem;color:var(--text-muted)">Delivery Time</div><div style="font-weight:700">${days[priority]}</div></div>
    </div>
    <div style="margin-top:0.8rem;font-size:0.8rem;color:var(--text-muted)">
      🤖 AI suggests <strong>${priority}</strong> delivery for ${name || 'your package'} (${weight}kg) from ${from} to ${to}. 
      ${priority === 'same-day' ? '⚡ Ultra-fast guaranteed!' : priority === 'express' ? '🚀 Best value for speed.' : '✅ Most economical option.'}
    </div>`;
  box.style.display = 'block';
}

function placeOrder() {
  const name = document.getElementById('pkgName').value.trim();
  const weight = document.getElementById('pkgWeight').value;
  const category = document.getElementById('pkgCategory').value;
  const priority = document.getElementById('pkgPriority').value;
  const pickupStreet = document.getElementById('pickupStreet').value.trim();
  const pickupCity = document.getElementById('pickupCity').value.trim();
  const dropStreet = document.getElementById('dropStreet').value.trim();
  const dropCity = document.getElementById('dropCity').value.trim();
  const recipient = document.getElementById('recipientName').value.trim();
  const phone = document.getElementById('recipientPhone').value.trim();

  if (!name || !weight || !category || !pickupStreet || !pickupCity || !dropStreet || !dropCity || !recipient || !phone) {
    showToast('⚠️ Please fill in all required fields.');
    return;
  }

  const days = { standard: 5, express: 2, 'same-day': 0 };
  const orderId = 'SD-' + (1043 + getOrders().length);

  const newOrder = {
    id: orderId,
    pkgName: name,
    category,
    weight: parseFloat(weight),
    priority,
    status: 'pending',
    from: pickupStreet + ', ' + pickupCity,
    to: dropStreet + ', ' + dropCity,
    recipient,
    recipientPhone: phone,
    createdAt: new Date().toISOString(),
    estimatedDelivery: new Date(Date.now() + 86400000 * days[priority]).toISOString(),
    driver: null,
    timeline: [
      { title: 'Order Placed', time: 'Just now', done: true },
      { title: 'Pickup Scheduled', time: 'Pending', done: false },
      { title: 'In Transit', time: 'Pending', done: false },
      { title: 'Out for Delivery', time: 'Pending', done: false },
      { title: 'Delivered', time: `Expected in ${days[priority]} day(s)`, done: false }
    ]
  };

  addOrder(newOrder);
  showToast('✅ Order ' + orderId + ' placed successfully!');
  clearOrderForm();

  // Switch to track
  setTimeout(() => quickTrack(orderId), 800);
}

function clearOrderForm() {
  ['pkgName','pkgWeight','pickupStreet','pickupCity','pickupPin','dropStreet','dropCity','dropPin','recipientName','recipientPhone'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('pkgCategory').value = '';
  document.getElementById('pkgPriority').value = 'standard';
  document.getElementById('estimateBox').style.display = 'none';
}

// ---- TRACK PAGE ----
function loadRecentOrders() {
  const orders = getOrders().slice(0, 4);
  const container = document.getElementById('recentOrdersList');
  container.innerHTML = orders.map(renderDeliveryCard).join('');
}

function trackOrder() {
  const input = document.getElementById('trackInput').value.trim().toUpperCase();
  const result = document.getElementById('trackResult');
  const error = document.getElementById('trackError');
  result.classList.add('hidden');
  error.classList.add('hidden');

  if (!input) return;

  const order = getOrders().find(o => o.id === input);
  if (!order) {
    error.classList.remove('hidden');
    return;
  }

  document.getElementById('trackOrderId').textContent = order.id;
  document.getElementById('trackPkgName').textContent = `${categoryIcon(order.category)} ${order.pkgName} • ${order.weight}kg • ${order.priority}`;
  
  const statusEl = document.getElementById('trackStatus');
  statusEl.textContent = statusLabel(order.status);
  statusEl.className = 'status-badge ' + statusClass(order.status);

  const etaEl = document.getElementById('mapEta');
  if (order.status === 'delivered') {
    etaEl.textContent = '✅ Delivered';
  } else {
    etaEl.textContent = 'ETA: ' + formatDate(order.estimatedDelivery);
  }

  // Timeline
  const tl = document.getElementById('trackTimeline');
  tl.innerHTML = order.timeline.map(t => `
    <div class="timeline-item">
      <div class="tl-dot ${t.done ? (t.active ? 'active' : 'done') : 'pending'}"></div>
      <div class="tl-info">
        <div class="tl-title" style="${t.done ? '' : 'color:var(--text-muted)'}">${t.title}</div>
        <div class="tl-time">${t.time || ''}</div>
      </div>
    </div>`).join('');

  result.classList.remove('hidden');
}

// ---- HISTORY PAGE ----
function loadHistoryPage(filter) {
  let orders = getOrders();
  if (filter !== 'all') orders = orders.filter(o => o.status === filter);
  const container = document.getElementById('historyList');
  if (orders.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:0.88rem;padding:1rem 0;">No orders found.</div>';
  } else {
    container.innerHTML = orders.map(renderDeliveryCard).join('');
  }
}

function filterHistory(filter, el) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  loadHistoryPage(filter);
}

// ---- PROFILE PAGE ----
function loadProfilePage() {
  const p = getProfile();
  document.getElementById('profName').value = p.name || '';
  document.getElementById('profEmail').value = p.email || '';
  document.getElementById('profPhone').value = p.phone || '';
  document.getElementById('profAddress').value = p.address || '';
  renderSavedAddresses();
}

function saveProfile() {
  updateProfile({
    name: document.getElementById('profName').value,
    email: document.getElementById('profEmail').value,
    phone: document.getElementById('profPhone').value,
    address: document.getElementById('profAddress').value
  });
  showToast('✅ Profile saved!');
}

function renderSavedAddresses() {
  const addrs = getSavedAddresses();
  const container = document.getElementById('savedAddresses');
  container.innerHTML = addrs.map(a => `
    <div class="address-card">
      <div><strong>${a.label}</strong><br><span style="font-size:0.8rem;color:var(--text-muted)">${a.address}</span></div>
      <button class="del-btn" onclick="deleteAddress(${a.id})">🗑️</button>
    </div>`).join('');
}

function addAddress() {
  const addr = prompt('Enter new address:');
  if (!addr) return;
  const label = prompt('Label (e.g. 🏠 Home, 🏢 Office):') || '📍 Address';
  addAddress({ id: Date.now(), label, address: addr });
  renderSavedAddresses();
  showToast('✅ Address added!');
}

function deleteAddress(id) {
  removeAddress(id);
  renderSavedAddresses();
  showToast('🗑️ Address removed.');
}

// ---- INIT ----
window.addEventListener('DOMContentLoaded', () => {
  loadHomePage();
});
