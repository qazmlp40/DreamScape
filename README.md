# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. 카카오톡 공유 설정

   - [카카오 개발자 콘솔](https://developers.kakao.com/console/app)에서 앱을 생성하고 네이티브 앱 키를 발급받으세요
   - `.env` 파일을 생성하고 카카오 앱 키를 설정하세요:
     ```
     EXPO_PUBLIC_KAKAO_APP_KEY=your_kakao_native_app_key_here
     ```
   - `app.json`의 Android `intentFilters`와 iOS `CFBundleURLSchemes`에 `kakao{네이티브 앱 키}` 형식의 URL 스킴을 등록하세요
   - 카카오 개발자 콘솔에서 Android 패키지명 `com.anonymous.dreamscape`, Android 키 해시, iOS 번들 ID `com.anonymous.dreamscape`를 등록하세요
   - 공유 메시지에 웹 링크를 넣으려면 `.env`의 `EXPO_PUBLIC_KAKAO_SHARE_WEB_URL` 도메인을 카카오 개발자 콘솔 > 제품 링크 > 웹 도메인에 등록하세요
   - 공유 이미지 URL은 외부 네트워크에서 접근 가능한 HTTPS 주소를 사용하세요
   - Expo Go에서는 네이티브 카카오 공유 SDK가 동작하지 않으므로 development build 또는 실제 빌드에서 확인하세요

3. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
