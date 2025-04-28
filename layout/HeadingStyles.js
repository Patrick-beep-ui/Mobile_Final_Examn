import Icon from 'react-native-vector-icons/FontAwesome'; 

export const bottomScreenOptions = ({ route }) => ({
  tabBarIcon: ({ color, size }) => {
    let iconName;

    if (route.name === 'ConverterStack') {
      iconName = 'bank';
    } else if (route.name === 'HistoryStack') {
      iconName = 'book';
    }

    return <Icon name={iconName} size={size} color={color} />;
  },
  tabBarActiveTintColor: '#6200ea',
  tabBarInactiveTintColor: 'gray',
  headerTitleAlign: 'center',
});