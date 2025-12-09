import Svg, { Path } from "react-native-svg";
import useScale from "../../hooks/useScale";

export default function Up_Arrow() {
    const { s } = useScale();
    const W = 23, H = 12;
    return(
    <Svg width={s(W)} height={s(H)} viewBox="0 0 24 13" fill="none" xmlns="http://www.w3.org/2000/svg">
        <Path d="M22.3084 12.6658C22.043 12.667 21.7882 12.5613 21.6017 12.3725L11.6417 2.41245L1.68172 12.3725C1.28771 12.7396 0.67371 12.7288 0.292894 12.3479C-0.087922 11.9671 -0.0987553 11.3531 0.26839 10.9591L10.9351 0.292453C11.3255 -0.0974845 11.958 -0.0974845 12.3484 0.292453L23.0151 10.9591C23.405 11.3495 23.405 11.982 23.0151 12.3725C22.8285 12.5613 22.5738 12.667 22.3084 12.6658Z" fill="black"/>
    </Svg>
    )
}