import Svg, { Path } from "react-native-svg";
import useScale from "../../hooks/useScale";

export default function Delete_Account_Icon() {
    const { s } = useScale();
    const W = 20, H = 20;
    
    return (
        <Svg xmlns="http://www.w3.org/2000/svg" width={s(W)} height={s(H)} viewBox="0 0 20 20" fill="none">
            <Path fill-rule="evenodd" clip-rule="evenodd" d="M10 0C4.47715 0 0 4.47715 0 10C0 15.5228 4.47715 20 10 20C15.5228 20 20 15.5228 20 10C20 7.34784 18.9464 4.8043 17.0711 2.92893C15.1957 1.05357 12.6522 0 10 0ZM1.5 10C1.49028 6.61789 3.4912 3.5534 6.5916 2.202C9.69199 0.850603 13.299 1.47073 15.77 3.78L3.77 15.78C2.30543 14.2124 1.49363 12.1453 1.5 10ZM4.9 16.78C6.36674 17.8945 8.15785 18.4986 10 18.5C13.2228 18.5077 16.1714 16.6878 17.6093 13.8035C19.0472 10.9192 18.7259 7.4691 16.78 4.9L4.9 16.78Z" fill="#BB7CFF"/>
        </Svg>
    )
}