// ty @ https://clrs.cc 🙏

const colors = {
  '0': '#FF4136', // red
  '1': '#FF851B', // orange
  '2': '#FFDC00', // yellow
  '3': '#01FF70', // lime
  '4': '#2ECC40', // green
  '5': '#3D9970', // olive
  '6': '#39CCCC', // teal
  '7': '#7FDBFF', // aqua
  '8': '#0074D9', // blue
  '9': '#001f3f', // navy
  '10': '#B10DC9', // purple
  '11': '#fa6be9', // pink
  '12': '#85144b', // maroon
  // '13': '#DDDDDD', // silver
  '13': '#AAAAAA', // grey
  '14': '#FFFFFF', // white
  '15': '#111111', // black
};

const lightColors = {
  '0': '#ff726b', // red
  '1': '#ffa04d', // orange
  '2': '#ffeb66', // yellow
  '3': '#99ffc5', // lime
  '4': '#7ee28a', // green
  '5': '#74c8a2', // olive
  '6': '#89e1e1', // teal
  '7': '#ccf1ff', // aqua
  '8': '#75bfff', // blue
  // '9': '#0052a3', // navy
  '9': '#1284db', // navy
  '10': '#e579f6', // purple
  '11': '#fdcef8', // pink
  '12': '#de217c', // maroon
  // '13': '#f2f2f2', // silver
  '13': '#dedede', // grey
  // '14': '#FFFFFF', // white
  // '15': '#383838', // black
};

const darkColors = {
  '0': '#9e0800', // red
  '1': '#b35300', // orange
  '2': '#b39b00', // yellow
  '3': '#009942', // lime
  '4': '#1b7926', // green
  '5': '#20503b', // olive
  '6': '#207e7e', // teal
  '7': '#0080b3', // aqua
  '8': '#003f75', // blue
  '9': '#a3d1ff', // navy
  '10': '#5c0769', // purple
  '11': '#c507af', // pink
  '12': '#f1a7cb', // maroon // 2c0719
  // '13': '#787878', // silver
  '13': '#787878', // grey
  '14': '#999999', // white
  '15': '#c4c4c4', // black
};

export function getColor(_index?: number) {
  const index = _index !== undefined ? _index % Object.keys(colors).length : Math.floor(Math.random() * Object.keys(colors).length);
  // @ts-ignore
  return colors[index.toString()];
}

export function getLightColor(_index?: number) {
  const index = _index !== undefined ? _index % Object.keys(lightColors).length : Math.floor(Math.random() * Object.keys(lightColors).length);
  // @ts-ignore
  return lightColors[index.toString()];
}

export function getDarkColor(_index?: number) {
  const index = _index !== undefined ? _index % Object.keys(darkColors).length : Math.floor(Math.random() * Object.keys(darkColors).length);
  // @ts-ignore
  return darkColors[index.toString()];
}