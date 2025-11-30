import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaFrameContext, SafeAreaProvider } from 'react-native-safe-area-context';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Terms from './pages/Terms';
import Profile from './pages/profile/Profile';
import Profile_Setting from './pages/profile/Profile_Setting';
import Profile_Inquiry from './pages/profile/Profile_Inquiry';
import { useFonts } from 'expo-font';

const Stack = createNativeStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    'Roboto-Regular': require('./assets/font/Roboto-Regular.ttf'),
    'Roboto-Bold': require('./assets/font/Roboto-Bold.ttf'),
    'Roboto-Medium': require('./assets/font/Roboto-Medium.ttf')
  });

  if (!fontsLoaded) {
    return null; // 폰트 로딩될 때까지 렌더 지연
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName='Profile'>
          <Stack.Screen name='Login' component={Login} options={{headerShown: false}}/>
          <Stack.Screen name='Signup' component={Signup} options={{headerShown: false}}/>
          <Stack.Screen name='Terms' component={Terms} options={{headerShown: false}} />
          <Stack.Screen name='Profile' component={Profile} options={{headerShown: false}}/>
          <Stack.Screen name='Profile_Setting' component={Profile_Setting} options={{headerShown: false}}/>
          <Stack.Screen name='Profile_Inquiry' component={Profile_Inquiry} options={{headerShown: false}}/>
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
