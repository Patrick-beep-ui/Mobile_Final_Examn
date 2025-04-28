import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import BottomTapNavigator from './navigators/BottomTapNavigator';
import { DBContext } from './context/ConnectionContext';

export default function App() {
  return (
    <DBContext>
      <NavigationContainer>
          <BottomTapNavigator />
      </NavigationContainer>
    </DBContext>
  );
}
