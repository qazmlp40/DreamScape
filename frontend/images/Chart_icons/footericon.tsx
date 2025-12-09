import React from 'react';
import Svg, { Path, Rect, G, Defs } from 'react-native-svg';
import useScale from '../../hooks/useScale';

export default function FooterIcon() {
  const { s } = useScale();
  
  return (
    <Svg width={s(31)} height={s(34)} viewBox="0 0 31 34" fill="none">
      <G>
        <Rect x="2" y="4.66675" width="26.6667" height="26.6667" rx="6.66667" fill="#C4CAFF" />
        <Rect x="6" y="15.3335" width="4" height="4" rx="1.33333" fill="#BB7CFF" />
        <Path d="M2 11.3334C2 7.65152 4.98477 4.66675 8.66667 4.66675H22C25.6819 4.66675 28.6667 7.65152 28.6667 11.3334V12.6667H2V11.3334Z" fill="#BB7CFF" />
        <Rect x="11.334" y="15.3335" width="4" height="4" rx="1.33333" fill="#BB7CFF" />
        <Rect x="19.334" y="2" width="2.66667" height="6.66667" rx="1.33333" fill="#744AA2" />
        <Rect x="8.66602" y="2" width="2.66667" height="6.66667" rx="1.33333" fill="#744AA2" />
        <Rect x="6" y="20.6667" width="4" height="4" rx="1.33333" fill="#BB7CFF" />
        <Rect x="11.334" y="20.6667" width="4" height="4" rx="1.33333" fill="#BB7CFF" />
      </G>
    </Svg>
  );
}
