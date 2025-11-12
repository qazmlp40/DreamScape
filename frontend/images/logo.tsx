import React from "react";
import { Image } from "react-native";
import useScale from "../hooks/useScale";

export default function Logo() {
  const { s } = useScale();
  return (
    <Image
      source={require("../assets/logo_img.png")} 
      style={{ width: s(120), height: s(120) }}
    />
  );
}