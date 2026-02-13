export const formatInteger = (value: number) => {
  let s = value.toString();  

  for (let i = s.length - 3; i > 0; i -= 3) {
    s = `${s.substring(0, i)}.${s.substring(i)}`;
  }

  return s;
};