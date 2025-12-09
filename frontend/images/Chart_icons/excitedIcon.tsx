import React from "react"
import { Image } from "react-native"
import useScale from "../../hooks/useScale"

export default function ExcitedIcon() {
    const { s } = useScale();
    return(
        <Image
            source={require("../../assets/Chart/excitedicon.png")}
            style={{ width:s(32), height: s(32) }}
        />
    )
}