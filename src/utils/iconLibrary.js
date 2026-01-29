import iconNames from "../data/pixelarticons.json";

const iconUrl = (name) =>
  `https://unpkg.com/pixelarticons@1.8.0/svg/${name}.svg`;

const hashString = (value) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getIconForKey = (key) => {
  const safeKey = String(key ?? "");
  const index = hashString(safeKey) % iconNames.length;
  const name = iconNames[index];
  return { name, url: iconUrl(name) };
};

export { iconNames, iconUrl, getIconForKey };
