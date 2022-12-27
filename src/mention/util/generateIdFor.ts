export default function generateIdFor(store: any, withAutoUpdate = false) {
  let id;

  do {
    id = String(Math.random()).replace('0.', 'id');
  } while (store[id]);

  if (withAutoUpdate) {
    store[id] = true;
  }

  return id;
}
