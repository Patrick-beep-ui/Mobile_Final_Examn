import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ScreenLayout from '../../layout/ScreenLayout';
import {Text} from 'react-native';
import { HistoryBook } from '../../components/HistoryBook';

const History = () => {
    return (
        <ScreenLayout>
            <HistoryBook/>
        </ScreenLayout>
    );
}

const {Navigator, Screen} = createNativeStackNavigator();

function HistoryStack() {
    return (
        <Navigator screenOptions={{headerShown: false}}>
            <Screen name="History" component={History} />
        </Navigator>
    );
}

export default HistoryStack;