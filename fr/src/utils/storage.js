export const getStores = () => {
  try {
    const raw = localStorage.getItem('stores');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const saveStores = (stores) => {
  localStorage.setItem('stores', JSON.stringify(stores));
};

export const generateId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const addStore = (store) => {
  const stores = getStores();
  stores.push(store);
  saveStores(stores);
  return store;
};

export const updateStore = (updatedStore) => {
  const stores = getStores().map((s) => (s.id === updatedStore.id ? updatedStore : s));
  saveStores(stores);
  return updatedStore;
};

export const getStoreById = (id) => {
  return getStores().find((s) => s.id === id);
};

export const approveStore = (id) => {
  const store = getStoreById(id);
  if (!store) return null;
  store.status = 'approved';
  return updateStore(store);
};

export const rejectStore = (id) => {
  const store = getStoreById(id);
  if (!store) return null;
  store.status = 'rejected';
  return updateStore(store);
};

export const addProductToStore = (storeId, product) => {
  const store = getStoreById(storeId);
  if (!store) return null;
  if (!Array.isArray(store.products)) store.products = [];
  store.products.push(product);
  return updateStore(store);
};



