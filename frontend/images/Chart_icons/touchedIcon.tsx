import React from "react"
import { Image } from "react-native"
import useScale from "../../hooks/useScale"

export default function TouchedIcon() {
    const { s } = useScale();
    return(
        <Image
            source={require("../../assets/Chart/touchedicon.png")}
            style={{ width:s(32), height: s(32) }}
        />
    )
}