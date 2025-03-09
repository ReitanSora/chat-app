/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#D8FDD2';
const tintColorDark = '#075e54';

export const Colors = {
  light: {
    text: '#121212',
    subtext: '#606060',
    background: '#fff',
    tint: tintColorLight,
    detail: '#25d366',
    message: '#128c7e',
    button: '#00A884',
    tabIconDefault: '#121212',
    tabIconSelected: tintColorLight,
    gray: '#a0a0a0',
    lightBlue: '#51d1f6'
  },
  dark: {
    text: '#FFF',
    subtext: '#606060',
    background: '#121212',
    tint: tintColorDark,
    detail: '#25d366',
    message: '#128c7e',
    tabIconDefault: '#FFF',
    tabIconSelected: tintColorDark,
  },
};
