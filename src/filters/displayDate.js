export default (time = '000000000') => {
  const str = time.substr(8);
  const [q, w, e, r, t, y] = str;
  return `${q}${w}:${e}${r}:${t}${y}`;
};
