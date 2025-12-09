import React from "react"
import { Image } from "react-native"
import useScale from "../../hooks/useScale"

export default function HapppyIcon() {
    const { s } = useScale();
    return(
        <Image
            source={require("../../assets/Chart/happyicon.png")}
            style={{ width:s(32), height: s(32) }}
        />
    )
}