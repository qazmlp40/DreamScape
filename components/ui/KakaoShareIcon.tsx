import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

export const KakaoShareIcon = ({ width = 48, height = 48 }) => (
  <Svg width={width} height={height} viewBox="0 0 48 48" fill="none">
    <Rect width="48" height="48" rx="8" fill="#FEE500"/>
    <Path
      d="M24 14C17.373 14 12 18.0367 12 22.9733C12 26.28 14.4933 29.1467 18.0667 30.5867L16.8 35.0667C16.7467 35.2667 16.96 35.44 17.1467 35.3333L22.4267 31.9867C22.9467 32.04 23.4667 32.08 24 32.08C30.627 32.08 36 28.0433 36 23.1067C36 18.17 30.627 14 24 14Z"
      fill="#3C1E1E"
    />
  </Svg>
);
