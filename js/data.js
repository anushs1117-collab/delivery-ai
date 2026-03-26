// ===== DATA STORE =====

const STORAGE_KEY = 'swiftdrop_data';

const defaultData = {
  orders: [
    {
      id: 'SD-1042',
      pkgName: 'Gaming Laptop',
      category: 'Electronics',
      weight: 3.2,
      priority: 'express',
      status: 'transit',
      from: '123 Main St, Mumbai',
      to: '456 Park Ave, Pune',
      recipient: 'Alice Johnson',
      recipientPhone: '+91 98700 11111',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      estimatedDelivery: new Date(Date.now() + 86400000).toISOString(),
      driver: 'Rajesh Kumar',
      driverPhone: '+91 99900 22222',
      timeline: [
        { title: 'Order Placed', time: '2 days ago, 9:00 AM', done: true },
        { title: 'Picked Up', time: '2 days ago, 11:30 AM', done: true },
        { title: 'In Transit', time: 'Yesterday, 8:00 AM', done: true, active: true },
        { title: 'Out for Delivery', time: 'Expected Today', done: false },
        { title: 'Delivered', time: 'Expected Tomorrow', done: false }
      ]
    },
    {
      id: 'SD-1041',
      pkgName: 'Office Documents',
      category: 'Documents',
      weight: 0.5,
      priority: 'same-day',
      status: 'delivered',
      from: '789 Baker St, Delhi',
      to: '101 Elm St, Noida',
      recipient: 'Bob Singh',
      recipientPhone: '+91 98800 33333',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      estimatedDelivery: new Date(Date.now() - 86400000 * 4).toISOString(),
      driver: 'Priya Sharma',
      driverPhone: '+91 99800 44444',
      timeline: [
        { title: 'Order Placed', time: '5 days ago', done: true },
        { title: 'Picked Up', time: '5 days ago', done: true },
        { title: 'In Transit', time: '4 days ago', done: true },
        { title: 'Out for Delivery', time: '4 days ago', done: true },
        { title: 'Delivered', time: '4 days ago, 3:15 PM', done: true }
      ]
    },
    {
      id: 'SD-1040',
      pkgName: 'Clothes & Accessories',
      category: 'Clothing',
      weight: 1.8,
      priority: 'standard',
      status: 'pending',
      from: '22 Oak Lane, Bangalore',
      to: '55 Rose St, Chennai',
      recipient: 'Priya Patel',
      recipientPhone: '+91 98600 55555',
      createdAt: new Date(Date.now() - 86400000 * 0.5).toISOString(),
      estimatedDelivery: new Date(Date.now() + 86400000 * 4).toISOString(),
      driver: null,
      timeline: [
        { title: 'Order Placed', time: '12 hours ago', done: true },
        { title: 'Picked Up', time: 'Pending', done: false },
        { title: 'In Transit', time: 'Pending', done: false },
        { title: 'Out for Delivery', time: 'Pending', done: false },
        { title: 'Delivered', time: 'Expected in 4 days', done: false }
      ]
    },
    {
      id: 'SD-1039',
      pkgName: 'Medical Supplies',
      category: 'Medical',
      weight: 2.1,
      priority: 'express',
      status: 'delivered',
      from: '33 Health St, Hyderabad',
      to: '77 Care Lane, Secunderabad',
      recipient: 'Dr. Ravi Verma',
      recipientPhone: '+91 98500 66666',
      createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
      estimatedDelivery: new Date(Date.now() - 86400000 * 7).toISOString(),
      driver: 'Amit Gupta',
      driverPhone: '+91 99700 77777',
      timeline: [
        { title: 'Order Placed', done: true },
        { title: 'Picked Up', done: true },
        { title: 'In Transit', done: true },
        { title: 'Out for Delivery', done: true },
        { title: 'Delivered', done: true }
      ]
    }
  ],
  profile: {
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+91 98765 43210',
    address: '123 Main Street, Mumbai, 400001'
  },
  savedAddresses: [
    { id: 1, label: '🏠 Home', address: '123 Main Street, Mumbai, 400001' },
    { id: 2, label: '🏢 Office', address: '456 Business Park, Andheri, Mumbai' }
  ]
};

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e) {}
  return JSON.parse(JSON.stringify(defaultData));
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch(e) {}
}

let AppData = loadData();

function getOrders() { return AppData.orders; }
function addOrder(order) {
  AppData.orders.unshift(order);
  saveData(AppData);
}
function getProfile() { return AppData.profile; }
function updateProfile(p) { AppData.profile = p; saveData(AppData); }
function getSavedAddresses() { return AppData.savedAddresses; }
function addAddress(addr) {
  AppData.savedAddresses.push(addr);
  saveData(AppData);
}
function removeAddress(id) {
  AppData.savedAddresses = AppData.savedAddresses.filter(a => a.id !== id);
  saveData(AppData);
}
