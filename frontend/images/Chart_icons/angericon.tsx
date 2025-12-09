import React from "react"
import { Image } from "react-native"
import useScale from "../../hooks/useScale"

export default function AngerIcon() {
    const { s } = useScale();
    return(
        <Image
            source={require("../../assets/Chart/angericon.png")}
            style={{ width:s(32), height: s(32) }}
        />
    )
}