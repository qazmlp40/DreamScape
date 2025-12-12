import React from "react";
import { Image, useWindowDimensions } from "react-native";

export default function Logo() {
  
      function useScale() {
          const width = useWindowDimensions().width; 
        
          const s = (px: number) => px * (width / 412);
        
          return { s, width };
        }

  const { s } = useScale();
  return (
    <Image
      source={require("../Icon_images/logo_img.png")} 
      style={{ width: s(120), height: s(120) }}
    />
  );
}