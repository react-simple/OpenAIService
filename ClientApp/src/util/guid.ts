export const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

// https://stackoverflow.com/questions/26501688/a-typescript-guid-class
// it can encode an integer number between 0 and 0xffff
// every hexadecimal digit of the number will be encoded into the Guid (should not be too long to leave place for random digits)
export const newGuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
