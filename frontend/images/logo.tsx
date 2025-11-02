import React from "react";
import { Image } from "react-native";

export default function Logo() {
  return (
    <Image
      source={require("../assets/logo_img.png")} 
      style={{ width: 160, height: 160 }}
    />
  );
}
