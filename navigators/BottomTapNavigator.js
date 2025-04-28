import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ConverterStack from './stack_navigators/Converter';
import HistoryStack from './stack_navigators/History';
import { bottomScreenOptions } from '../layout/HeadingStyles';

const {Navigator, Screen} = createBottomTabNavigator();

function BottomTapNavigator() {
    return (
        <Navigator screenOptions={bottomScreenOptions}>
            <Screen name="ConverterStack" component={ConverterStack} options={{title: 'Converter'}} />
            <Screen name="HistoryStack" component={HistoryStack} options={{title: 'History'}} />
        </Navigator>
    );
}

export default BottomTapNavigator;