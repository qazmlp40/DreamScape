/**
 * 회원가입 페이지
 *
 * 수정 사항:
 * 1. API_BASE_URL 사용 - constants/api.ts에서 import하여 서버 URL 통합 관리
 * 2. 타임아웃 처리 - 10초 타임아웃 추가 (AbortController 사용)
 * 3. 중복 요청 방지 - isSubmitting 상태로 중복 클릭 방지
 * 4. 로딩 상태 표시 - 회원가입 중일 때 "처리중..." 표시 및 버튼 비활성화
 * 5. 에러 메시지 개선 - 타임아웃/연결 실패 시 구체적인 메시지 표시
 * 6. finally 블록 추가 - 에러 발생 시에도 isSubmitting 상태 초기화
 */
import { API_BASE_URL, DEV_MOCK_AUTH } from "@/constants/api";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  Keyboard,
  LogBox,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { useAppDialog } from "../../contexts/AppDialogContext";
import Logo from "./Icons/logo";

LogBox.ignoreLogs(["Error measuring text field"]);

export const BASE_WIDTH = 412;

function useScale() {
  const width = useWindowDimensions().width;
  const s = (px: number) => px * (width / BASE_WIDTH);
  return { s, width };
}

// Right_Arrow 아이콘 (>)
const Right_Arrow: React.FC = () => {
  const { s } = useScale();
  const W = 10;
  const H = 18;

  return (
    <Svg width={s(W)} height={s(H)} viewBox="0 0 10 18" fill="none">
      <Path
        d="M0.99995 17.75C1.19902 17.7509 1.39007 17.6716 1.52995 17.53L9.52995 9.52997C9.8224 9.23715 9.8224 8.76279 9.52995 8.46997L1.52995 0.469969C1.23444 0.19461 0.773941 0.202735 0.488329 0.488347C0.202717 0.773959 0.194592 1.23446 0.469951 1.52997L7.93995 8.99997L0.469951 16.47C0.177497 16.7628 0.177497 17.2372 0.469951 17.53C0.609835 17.6716 0.800884 17.7509 0.99995 17.75Z"
        fill="#282828"
      />
    </Svg>
  );
};

// useSignupForm
function useSignupForm() {
  // 회원가입 입력값 상태
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [ID, setID] = useState("");
  const [PW, setPW] = useState("");
  const [checkPW, setCheckPW] = useState("");

  // reset() : 폼 초기화
  const reset = () => {
    setUsername("");
    setEmail("");
    setID("");
    setPW("");
    setCheckPW("");
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    ID,
    setID,
    PW,
    setPW,
    checkPW,
    setCheckPW,
    reset,
  };
}

/* -----------------------------------------
  📌 Input 컴포넌트
------------------------------------------ */
type InputProps = {
  value: string;
  setValue: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: boolean;
};

const Input: React.FC<InputProps> = ({
  value,
  setValue,
  placeholder,
  secureTextEntry,
  error,
}) => {
  const { s } = useScale();
  return (
    <View>
      <TextInput
        style={[
          styles.input,
          error && styles.input_error,
          { paddingHorizontal: s(16), paddingVertical: s(20) },
        ]}
        onChangeText={setValue}
        value={value}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

/* -----------------------------------------
  📌 CheckBtn 컴포넌트
------------------------------------------ */
type CheckBtnProps = {
  checked: boolean;
  setChecked: (value: boolean) => void;
};

const CheckBtn: React.FC<CheckBtnProps> = ({ checked, setChecked }) => {
  const { s } = useScale();
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => setChecked(!checked)}>
      <View
        style={[
          styles.check_circle,
          checked ? styles.check_on : styles.check_off,
          { width: s(24), height: s(24) },
        ]}
      >
        <MaterialIcons
          name="check"
          size={s(17)}
          color={checked ? "#FFF" : "#282828"}
        />
      </View>
    </TouchableOpacity>
  );
};

/* -----------------------------------------
  📌 CompleteBtn 컴포넌트
------------------------------------------ */
type CompleteBtnProps = {
  onPress?: () => void;
  disabled?: boolean;
  title?: string;
};

const CompleteBtn: React.FC<CompleteBtnProps> = ({
  onPress,
  disabled = false,
  title,
}) => {
  const { s } = useScale();
  return (
    <TouchableOpacity
      activeOpacity={disabled ? 1 : 0.8}
      style={[
        styles.button,
        disabled ? styles.button_disabled : styles.button_active,
        { height: s(60) },
      ]}
      onPress={disabled ? undefined : onPress}
    >
      <Text style={styles.button_text}>{title}</Text>
    </TouchableOpacity>
  );
};

/* -----------------------------------------
  📌 Signup 페이지 본체
------------------------------------------ */
const Signup: React.FC = () => {
  const navigation = useNavigation();
  const { s } = useScale();
  const { showDialog } = useAppDialog();
  const {
    username,
    setUsername,
    email,
    setEmail,
    ID,
    setID,
    PW,
    setPW,
    checkPW,
    setCheckPW,
  } = useSignupForm();

  const [pwError, setPwError] = useState(false);
  const [globalErr, setGlobalErr] = useState("");
  const { acceptedTerms } = useLocalSearchParams<{ acceptedTerms?: string }>();
  const [termChecked, setTermChecked] = useState(false);
  const [scrollEnabled, setScrollEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const params = useLocalSearchParams();

  useEffect(() => {
    if (acceptedTerms === "1") {
      setTermChecked(true);
    }
  }, [acceptedTerms]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setScrollEnabled(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setScrollEnabled(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const isDisabled =
    ID.trim() === "" ||
    PW.trim() === "" ||
    email.trim() === "" ||
    checkPW.trim() === "" ||
    termChecked === false;

  const toggleTerms = useCallback(() => {
    setTermChecked((prev) => !prev);
  }, []);

  // 회원가입 처리 함수
  const handleSignup = useCallback(async () => {
    if (isSubmitting) return; // 중복 요청 방지

    setPwError(false);
    setGlobalErr("");

    if (PW !== checkPW) {
      setPwError(true);
      setGlobalErr("비밀번호를 잘못 입력하였습니다");
      return;
    }

    if (isDisabled) {
      setGlobalErr("입력값을 확인하고 약관에 동의해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        userNickName: ID.trim(),
        name: username.trim(),
        email: email.trim().toLowerCase(),
        password: PW,
        profileImage: "https://picsum.photos/200/200",
        socialProvider: "local",
      };

      if (DEV_MOCK_AUTH) {
        console.log("[Signup] DEV_MOCK_AUTH 회원가입 우회:", payload);
        showDialog({
          title: "회원가입 완료",
          message: "회원가입이 완료되었습니다.",
          buttons: [{ text: "확인", onPress: () => router.replace("/(auth)/login") }],
        });
        return;
      }

      console.log("[Signup] 요청 URL:", `${API_BASE_URL}/t_user/signup`);
      console.log("[Signup] 요청 payload:", payload);

      // 10초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch(`${API_BASE_URL}/t_user/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal, // 타임아웃 신호
      });

      clearTimeout(timeoutId);

      const text = await res.text();
      let data: { message?: string } = {};

      console.log("[Signup] 응답 status:", res.status);
      console.log("[Signup] 응답 text:", text);

      try {
        data = JSON.parse(text);
      } catch {
        // JSON 아닐 수도 있으니 무시
      }

      console.log("[Signup] 파싱된 응답:", data);

      const responseMessage = data?.message?.trim() || text?.trim();

      if (!res.ok) {
        setGlobalErr(responseMessage || "회원가입에 실패했습니다.");
        return;
      }

      // 성공
      showDialog({
        title: "회원가입 완료",
        message: responseMessage || "회원가입이 완료되었습니다.",
        buttons: [{ text: "확인", onPress: () => router.replace("/(auth)/login") }],
      });
    } catch (e: any) {
      // 타임아웃과 일반 에러 구분
      if (e.name === "AbortError") {
        setGlobalErr("서버 응답 시간 초과. 네트워크를 확인해주세요.");
      } else {
        setGlobalErr(`서버 연결 실패: ${API_BASE_URL}`);
      }
      console.error("Signup error:", e);
    } finally {
      // 에러 발생 시에도 상태 초기화
      setIsSubmitting(false);
    }
  }, [PW, checkPW, username, ID, email, isDisabled, isSubmitting, navigation]);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView
        edges={["top"]}
        style={{ flex: 1, backgroundColor: "#fff" }}
      >
        <View style={styles.container}>
          <KeyboardAwareScrollView
            style={styles.scroll}
            scrollEnabled={scrollEnabled}
            enableOnAndroid
            extraScrollHeight={20}
          >
            {/* 로고 */}
            <View
              style={[
                styles.logo_container,
                { marginTop: s(68), marginBottom: s(32) },
              ]}
            >
              <Logo />
            </View>

            {/* 입력창 */}
            <View style={[styles.input_container, { marginHorizontal: s(32) }]}>
              <Input
                value={username}
                setValue={setUsername}
                placeholder="이름"
              />
              <View style={{ height: s(16) }} />
              <Input value={email} setValue={setEmail} placeholder="이메일" />
              <View style={{ height: s(16) }} />
              <Input value={ID} setValue={setID} placeholder="아이디" />
              <View style={{ height: s(16) }} />
              <Input
                value={PW}
                setValue={setPW}
                placeholder="비밀번호"
                secureTextEntry
                error={pwError}
              />
              <View style={{ height: s(16) }} />
              <Input
                value={checkPW}
                setValue={setCheckPW}
                placeholder="비밀번호 확인"
                secureTextEntry
                error={pwError}
              />
            </View>

            {/* 에러 메시지 */}
            {!!globalErr && (
              <Text
                style={[
                  styles.error_text,
                  { marginHorizontal: s(32), marginTop: s(8) },
                ]}
              >
                {globalErr}
              </Text>
            )}

            {/* 약관 동의 */}
            <View
              style={[
                styles.terms_container,
                { marginHorizontal: s(16), marginTop: s(32) },
              ]}
            >
              <View style={styles.checkbox_container}>
                <CheckBtn checked={termChecked} setChecked={toggleTerms} />
                <Text style={[styles.terms_text, { marginLeft: s(16) }]}>
                  회원가입 및 이용약관에 동의하겠습니까?
                </Text>
              </View>
            </View>

            {/* 약관 상세보기 */}
            <View
              style={[
                styles.terms_detail_container,
                {
                  marginTop: s(30),
                  marginHorizontal: s(36),
                  paddingLeft: s(36),
                },
              ]}
            >
              <Text style={styles.detail_text}>이용약관 확인하기</Text>
              <TouchableOpacity onPress={toggleTerms}>
                <Right_Arrow />
              </TouchableOpacity>
            </View>
          </KeyboardAwareScrollView>

          {/* 완료 버튼 */}
          <View
            style={[
              styles.button_container,
              {
                position: "absolute",
                left: s(16),
                right: s(16),
                bottom: s(23),
              },
            ]}
          >
            {/* 완료 버튼 - 제출 중일 때 "처리중..." 표시 */}
            <CompleteBtn
              onPress={handleSignup}
              disabled={isDisabled || isSubmitting}
              title={isSubmitting ? "처리중..." : "완료"}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default Signup;

/* -----------------------------------------
  📌 스타일
------------------------------------------ */
const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    backgroundColor: "#fff",
  },
  logo_container: {
    width: "100%",
    alignItems: "center",
  },
  scroll: {},
  input_container: {},
  error_text: {
    color: "#FF3D3D",
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    fontWeight: "400",
  },
  input: {
    width: "100%",
    // RN에선 boxShadow가 정식 속성은 아니지만, 원래 코드 유지
    boxShadow: "0px 0px 1.5px rgba(0, 0, 0, 0.25)" as any,
    flexDirection: "row",
    alignItems: "center",
    fontSize: 14,
    fontFamily: "Roboto-Nomal",
    color: "#999",
    textAlign: "left",
    fontWeight: "400",
    borderRadius: 8,
  },
  input_error: {
    width: "100%",
    borderColor: "#FF3D3D",
    borderWidth: 1,
    boxShadow: "0px 0px 1.5px rgba(0, 0, 0, 0.25)" as any,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 8,
  },
  terms_container: {},
  checkbox_container: {
    flexDirection: "row",
    alignItems: "center",
  },
  check_circle: {
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  check_off: {
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "#282828",
  },
  check_on: {
    backgroundColor: "#BB7CFF",
    borderColor: "#BB7CFF",
  },
  terms_text: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    color: "#282828",
    fontWeight: "500",
  },
  terms_detail_container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detail_text: {
    fontSize: 12,
    fontFamily: "Roboto-Regular",
    color: "#282828",
    fontWeight: "500",
  },
  button_container: {},
  button: {
    width: "100%",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  button_active: {
    backgroundColor: "#BB7CFF",
  },
  button_disabled: {
    backgroundColor: "#CACACA",
  },
  button_text: {
    fontSize: 18,
    fontFamily: "Roboto-Regular",
    color: "#FFF",
    textAlign: "center",
    fontWeight: "700",
  },
});
