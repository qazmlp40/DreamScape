import Svg, { Path } from "react-native-svg";
import useScale from "../../hooks/useScale";

export default function Back_Btn() {
    const { s } = useScale();
    const W = 48, H = 48;

    return(
        <Svg width={s(W)} height={s(H)} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M27.4102 19.4102L22.8301 24L27.4102 28.5898L26 30L20 24L26 18L27.4102 19.4102Z" fill="#2E2E34"/>
        </Svg>
    )
}