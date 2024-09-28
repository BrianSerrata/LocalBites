// navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileCreationScreen from '../screens/ProfileCreationScreen';
import RestaurantDiscoveryScreen from '../screens/RestaurantDiscoveryScreen.js';
// import HomeScreen from '../screens/HomeScreen'; // Assuming you have a Home screen

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Profile Creation" component={ProfileCreationScreen} />
      <Stack.Screen name="Restaurant Discovery" component={RestaurantDiscoveryScreen} />
      {/* Add other screens here */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
