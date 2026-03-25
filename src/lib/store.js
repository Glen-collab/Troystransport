// localStorage-based data store replacing Base44 backend

const DEFAULT_FEED_YARD = {
  id: 'fy-1',
  name: 'All Feed Yards',
  contact_name: '',
  phone: '',
  location: 'Oshkosh, NE',
};

const DEFAULT_FARMS = [
  'Anderson Farm',
  'Miller Brothers',
  'Sunrise Acres',
  'Ridgeline Ranch',
  'Green Valley',
  'Johnson Feedlot',
  'Twin Oak Farm',
  'Creek Side',
  'Hillcrest Holdings',
  'Blue River Beef',
  'Prairie Star',
  'Lakeview Livestock',
  'Westfield Ranch',
  'Broken Arrow Farm',
  'Prairie View Cattle',
  'Cedar Creek Ranch',
  'Platte Valley Farms',
  'Sunrise Cattle Co',
  'High Plains Ranch',
  'Rolling Hills Farm',
  'Sandhills Heritage',
  'Valentine Cattle',
  'Elkhorn Ranch',
  'North Star Farms',
].map((name, i) => ({
  id: `farm-${i + 1}`,
  name,
  feed_yard_id: 'fy-1',
  sort_order: i + 1,
}));

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function getCollection(key) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function setCollection(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function initDefaults() {
  if (!getCollection('feedYards')) {
    setCollection('feedYards', [DEFAULT_FEED_YARD]);
  }
  if (!getCollection('farms')) {
    setCollection('farms', DEFAULT_FARMS);
  }
  if (!getCollection('loads')) {
    setCollection('loads', []);
  }
}

// Initialize on first load
initDefaults();

// Generic CRUD for a collection
function createEntity(collectionKey) {
  return {
    list() {
      return Promise.resolve(getCollection(collectionKey) || []);
    },

    filter(criteria, sortBy) {
      const items = getCollection(collectionKey) || [];
      let filtered = items.filter(item => {
        return Object.entries(criteria).every(([key, val]) => item[key] === val);
      });
      if (sortBy) {
        filtered.sort((a, b) => (a[sortBy] || 0) - (b[sortBy] || 0));
      }
      return Promise.resolve(filtered);
    },

    create(data) {
      const items = getCollection(collectionKey) || [];
      const newItem = { ...data, id: generateId() };
      items.push(newItem);
      setCollection(collectionKey, items);
      return Promise.resolve(newItem);
    },

    update(id, data) {
      const items = getCollection(collectionKey) || [];
      const idx = items.findIndex(item => item.id === id);
      if (idx !== -1) {
        items[idx] = { ...items[idx], ...data };
        setCollection(collectionKey, items);
        return Promise.resolve(items[idx]);
      }
      return Promise.reject(new Error('Not found'));
    },

    delete(id) {
      let items = getCollection(collectionKey) || [];
      items = items.filter(item => item.id !== id);
      setCollection(collectionKey, items);
      return Promise.resolve();
    },
  };
}

export const store = {
  feedYards: createEntity('feedYards'),
  farms: createEntity('farms'),
  loads: createEntity('loads'),
};
