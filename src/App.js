// src/App.js
import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from './screens/WelcomeScreen';
import VoiceScreen from './screens/VoiceScreen';
import ResultScreen from './screens/ResultScreen';

import { colors } from './theme';

const Stack = createNativeStackNavigator();
console.log(WelcomeScreen);
console.log(VoiceScreen);
console.log(ResultScreen);

// ✅ Build a safe theme with fonts fallback
const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.bg,
    card: colors.card,
    text: colors.text,
    primary: colors.brand,
    border: colors.border,
    notification: colors.brand,
  },
};

export default function App() {
  return (
    <NavigationContainer theme={MyTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Voice" component={VoiceScreen} options={{ title: 'Voice Chat' }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ title: 'Your Emotion' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

