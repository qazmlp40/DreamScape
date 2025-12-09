import Svg, { Path } from "react-native-svg";
import useScale from "../../hooks/useScale";

export default function Under_Arrow()  {
    const { s } = useScale();
    const W = 23, H = 12;

    return(
        <Svg width={s(W)} height={s(H)} viewBox="0 0 24 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <Path d="M11.6417 12.6417C11.3763 12.643 11.1216 12.5372 10.9351 12.3484L0.26839 1.68172C-0.0987553 1.28771 -0.087922 0.67371 0.292894 0.292894C0.67371 -0.087922 1.28771 -0.0987553 1.68172 0.26839L11.6417 10.2284L21.6017 0.26839C21.9957 -0.0987553 22.6097 -0.087922 22.9906 0.292894C23.3714 0.67371 23.3822 1.28771 23.0151 1.68172L12.3484 12.3484C12.1619 12.5372 11.9071 12.643 11.6417 12.6417Z" fill="black"/>
        </Svg>
    )
}