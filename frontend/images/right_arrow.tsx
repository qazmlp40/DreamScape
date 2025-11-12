import Svg, { Path } from "react-native-svg"
import useScale from "../hooks/useScale"

export default function Right_Arrow() {
    const { s } = useScale();
    const W = 10, H = 18
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width={s(W)} height={s(H)} viewBox="0 0 10 18" fill="none">
            <Path d="M0.99995 17.75C1.19902 17.7509 1.39007 17.6716 1.52995 17.53L9.52995 9.52997C9.8224 9.23715 9.8224 8.76279 9.52995 8.46997L1.52995 0.469969C1.23444 0.19461 0.773941 0.202735 0.488329 0.488347C0.202717 0.773959 0.194592 1.23446 0.469951 1.52997L7.93995 8.99997L0.469951 16.47C0.177497 16.7628 0.177497 17.2372 0.469951 17.53C0.609835 17.6716 0.800884 17.7509 0.99995 17.75Z" fill="#282828"/>
        </Svg>
    )
}