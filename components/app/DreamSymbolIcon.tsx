import KitchenIcon from "@/assets/images/icons/dream_symbol/Kitchen.svg";
import LightningIcon from "@/assets/images/icons/dream_symbol/Lightning.svg";
import AncestorIcon from "@/assets/images/icons/dream_symbol/ancestor.svg";
import BearIcon from "@/assets/images/icons/dream_symbol/bear.svg";
import BirdCrowIcon from "@/assets/images/icons/dream_symbol/bird_crow.svg";
import BodyIcon from "@/assets/images/icons/dream_symbol/body.svg";
import BrothersIcon from "@/assets/images/icons/dream_symbol/brothers.svg";
import ButterflyIcon from "@/assets/images/icons/dream_symbol/butterfly.svg";
import CatIcon from "@/assets/images/icons/dream_symbol/cat.svg";
import CelebrityIcon from "@/assets/images/icons/dream_symbol/celebrity.svg";
import CloudIcon from "@/assets/images/icons/dream_symbol/cloud.svg";
import CoupleIcon from "@/assets/images/icons/dream_symbol/couple.svg";
import DoctorIcon from "@/assets/images/icons/dream_symbol/doctor.svg";
import DogIcon from "@/assets/images/icons/dream_symbol/dog.svg";
import DragonIcon from "@/assets/images/icons/dream_symbol/dragon.svg";
import FireIcon from "@/assets/images/icons/dream_symbol/fire.svg";
import FoxIcon from "@/assets/images/icons/dream_symbol/fox.svg";
import FriendIcon from "@/assets/images/icons/dream_symbol/friend.svg";
import FrostIcon from "@/assets/images/icons/dream_symbol/frost.svg";
import HeadIcon from "@/assets/images/icons/dream_symbol/head.svg";
import HeartIcon from "@/assets/images/icons/dream_symbol/heart.svg";
import HorseIcon from "@/assets/images/icons/dream_symbol/horse.svg";
import KidIcon from "@/assets/images/icons/dream_symbol/kid.svg";
import LandIcon from "@/assets/images/icons/dream_symbol/land.svg";
import MarketIcon from "@/assets/images/icons/dream_symbol/market.svg";
import MoonIcon from "@/assets/images/icons/dream_symbol/moon.svg";
import MountainIcon from "@/assets/images/icons/dream_symbol/mountain.svg";
import ParentsIcon from "@/assets/images/icons/dream_symbol/parents.svg";
import PigIcon from "@/assets/images/icons/dream_symbol/pig.svg";
import RabbitIcon from "@/assets/images/icons/dream_symbol/rabbit.svg";
import RainIcon from "@/assets/images/icons/dream_symbol/rain.svg";
import RainbowIcon from "@/assets/images/icons/dream_symbol/rainbow.svg";
import RiverIcon from "@/assets/images/icons/dream_symbol/river.svg";
import RockIcon from "@/assets/images/icons/dream_symbol/rock.svg";
import SchoolIcon from "@/assets/images/icons/dream_symbol/school.svg";
import SeaIcon from "@/assets/images/icons/dream_symbol/sea.svg";
import SkyIcon from "@/assets/images/icons/dream_symbol/sky.svg";
import SmokeIcon from "@/assets/images/icons/dream_symbol/smoke.svg";
import SnakeIcon from "@/assets/images/icons/dream_symbol/snake.svg";
import SnowIcon from "@/assets/images/icons/dream_symbol/snow.svg";
import StarIcon from "@/assets/images/icons/dream_symbol/star.svg";
import SunIcon from "@/assets/images/icons/dream_symbol/sun_2.svg";
import SunsetIcon from "@/assets/images/icons/dream_symbol/sunset.svg";
import SweatIcon from "@/assets/images/icons/dream_symbol/sweat.svg";
import TeacherIcon from "@/assets/images/icons/dream_symbol/teacher.svg";
import TigerIcon from "@/assets/images/icons/dream_symbol/tiger.svg";
import TombIcon from "@/assets/images/icons/dream_symbol/tomb.svg";
import WarehouseIcon from "@/assets/images/icons/dream_symbol/warehouse.svg";
import WaterIcon from "@/assets/images/icons/dream_symbol/water.svg";
import WindIcon from "@/assets/images/icons/dream_symbol/wind.svg";
import WolfIcon from "@/assets/images/icons/dream_symbol/wolf.svg";
import React from "react";

type Props = {
  tags?: string[];
  text?: string;
  width?: number;
  height?: number;
};

const SYMBOL_MATCHERS = [
  { keywords: ["부엌", "주방", "kitchen"], Icon: KitchenIcon },
  { keywords: ["번개", "벼락", "lightning"], Icon: LightningIcon },
  { keywords: ["돼지", "pig"], Icon: PigIcon },
  { keywords: ["친구", "friend", "동료"], Icon: FriendIcon },
  { keywords: ["가족", "부모", "엄마", "아빠", "parents"], Icon: ParentsIcon },
  { keywords: ["조상", "ancestor"], Icon: AncestorIcon },
  { keywords: ["형제", "자매", "남매", "brothers"], Icon: BrothersIcon },
  { keywords: ["아이", "아기", "어린이", "kid"], Icon: KidIcon },
  { keywords: ["선생님", "교사", "teacher"], Icon: TeacherIcon },
  { keywords: ["의사", "병원", "doctor"], Icon: DoctorIcon },
  { keywords: ["연예인", "유명인", "celebrity"], Icon: CelebrityIcon },
  { keywords: ["연인", "커플", "couple"], Icon: CoupleIcon },
  { keywords: ["학교", "수업", "시험", "school"], Icon: SchoolIcon },
  { keywords: ["물", "water"], Icon: WaterIcon },
  { keywords: ["바다", "sea"], Icon: SeaIcon },
  { keywords: ["강", "river"], Icon: RiverIcon },
  { keywords: ["땅", "흙", "육지", "land"], Icon: LandIcon },
  { keywords: ["비", "rain"], Icon: RainIcon },
  { keywords: ["무지개", "rainbow"], Icon: RainbowIcon },
  { keywords: ["눈", "snow"], Icon: SnowIcon },
  { keywords: ["서리", "frost"], Icon: FrostIcon },
  { keywords: ["바람", "wind"], Icon: WindIcon },
  { keywords: ["연기", "smoke"], Icon: SmokeIcon },
  { keywords: ["불", "fire"], Icon: FireIcon },
  { keywords: ["해", "태양", "sun"], Icon: SunIcon },
  { keywords: ["노을", "석양", "sunset"], Icon: SunsetIcon },
  { keywords: ["달", "moon"], Icon: MoonIcon },
  { keywords: ["별", "star"], Icon: StarIcon },
  { keywords: ["구름", "cloud"], Icon: CloudIcon },
  { keywords: ["하늘", "sky"], Icon: SkyIcon },
  { keywords: ["산", "mountain"], Icon: MountainIcon },
  { keywords: ["바위", "돌", "rock"], Icon: RockIcon },
  { keywords: ["창고", "warehouse"], Icon: WarehouseIcon },
  { keywords: ["무덤", "묘", "tomb"], Icon: TombIcon },
  { keywords: ["개", "dog"], Icon: DogIcon },
  { keywords: ["고양이", "cat"], Icon: CatIcon },
  { keywords: ["토끼", "rabbit"], Icon: RabbitIcon },
  { keywords: ["곰", "bear"], Icon: BearIcon },
  { keywords: ["호랑이", "tiger"], Icon: TigerIcon },
  { keywords: ["늑대", "wolf"], Icon: WolfIcon },
  { keywords: ["여우", "fox"], Icon: FoxIcon },
  { keywords: ["말", "horse"], Icon: HorseIcon },
  { keywords: ["뱀", "snake"], Icon: SnakeIcon },
  { keywords: ["용", "dragon"], Icon: DragonIcon },
  { keywords: ["까마귀", "새", "bird", "crow"], Icon: BirdCrowIcon },
  { keywords: ["나비", "butterfly"], Icon: ButterflyIcon },
  { keywords: ["몸", "신체", "body"], Icon: BodyIcon },
  { keywords: ["머리", "얼굴", "head"], Icon: HeadIcon },
  { keywords: ["땀", "sweat"], Icon: SweatIcon },
  { keywords: ["시장", "가게", "market"], Icon: MarketIcon },
  { keywords: ["사랑", "heart"], Icon: HeartIcon },
];

const normalizeToken = (value: string) => value.trim().toLowerCase();
const stripKoreanParticle = (value: string) =>
  value.replace(/(이|가|은|는|을|를|에|에서|으로|로|과|와|도|만|처럼|까지|부터)$/u, "");

const findStrictMatch = (values: string[]) => {
  const normalizedValues = values.map(normalizeToken).filter(Boolean);

  return SYMBOL_MATCHERS.find(({ keywords }) =>
    keywords.some((keyword) =>
      normalizedValues.some((value) => value === normalizeToken(keyword)),
    ),
  );
};

const findConservativeTextMatch = (text: string) => {
  const normalizedText = normalizeToken(text);

  if (!normalizedText) {
    return undefined;
  }

  const textTokens = normalizedText
    .split(/[\s,。.!?;:()[\]{}"'“”‘’]+/)
    .map((token) => token.trim())
    .filter(Boolean);
  const comparableTokens = textTokens.flatMap((token) => {
    const strippedToken = stripKoreanParticle(token);
    return strippedToken && strippedToken !== token ? [token, strippedToken] : [token];
  });

  return SYMBOL_MATCHERS.find(({ keywords }) =>
    keywords.some((keyword) => {
      const normalizedKeyword = normalizeToken(keyword);

      if (
        comparableTokens.some(
          (token) =>
            token === normalizedKeyword ||
            token === `${normalizedKeyword}꿈` ||
            token.startsWith(`${normalizedKeyword}꿈`),
        )
      ) {
        return true;
      }

      const escapedKeyword = normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|\\s|[,.!?;:()\\[\\]{}"'“”‘’])${escapedKeyword}(\\s|$|[,.!?;:()\\[\\]{}"'“”‘’])`).test(normalizedText);
    }),
  );
};

export default function DreamSymbolIcon({
  tags = [],
  text = "",
  width = 116,
  height = 116,
}: Props) {
  const match = findStrictMatch(tags) ?? findConservativeTextMatch(text);
  const Icon = match?.Icon ?? StarIcon;
  return <Icon width={width} height={height} />;
}
