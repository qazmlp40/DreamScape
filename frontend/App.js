import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import Login from './pages/Login';
import Signup from './pages/Signup';
import Terms from './pages/Terms';
import RecordVoice from './pages/record/RecordVoice';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='RecordVoice'>
        <Stack.Screen name='Login' component={Login} options={{headerShown: false}}/>
        <Stack.Screen name='Signup' component={Signup} options={{headerShown: false}}/>
        <Stack.Screen name='Terms' component={Terms} options={{headerShown: false}} />
        <Stack.Screen name='RecordVoice' component={RecordVoice} options={{headerShown: false}} />
      </Stack.Navigator>
    </NavigationContainer>
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
