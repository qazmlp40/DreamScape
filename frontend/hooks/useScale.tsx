import { useWindowDimensions } from 'react-native';

export const BASE_WIDTH = 412; // 피그마 화면의 넓이

export default function useScale() {
  const width = useWindowDimensions().width; // 현재 기기의 화면 넓이

  const s = (px: number) => px * (width/BASE_WIDTH);

  return { s, width };
}