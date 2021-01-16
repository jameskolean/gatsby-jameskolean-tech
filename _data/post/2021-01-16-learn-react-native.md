---
template: BlogPost
date: 2021-01-16
published: true
title: 'Learn React Native'
source: 'https://gitlab.com/jameskolean/learn-react-native'
tags:
  - React
  - React Native
thumbnail: /assets/read-cell-on-steps-unsplash.jpg
---

This is a place I will be testing out React Native.

# Navigation

This example tries to pull together all the navigation schemes

- Stack Navigation with Search / Detail style screens (see Home and Detail Screens)
- Drawer Navigation (see Profile Screen)
- Tab Navigation (see Settings Screen)

These two files show how it's done.=

> /src/components/navigation.js

```javascript
//@ts-check
import React from 'react'
import { Button } from 'react-native'

import { createStackNavigator } from '@react-navigation/stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createDrawerNavigator } from '@react-navigation/drawer'

import HomeScreen from '../screens/home-screen'
import DetailScreen from '../screens/detail-screen'
import ProfileScreen from '../screens/profile-screen'
import SettingsScreen from '../screens/settings-screen'
const Stack = createStackNavigator()
const Tab = createBottomTabNavigator()
const Drawer = createDrawerNavigator()

export const MainDrawerNavigator = () => (
  <Drawer.Navigator initialRouteName='Home'>
    <Drawer.Screen name='Home' component={BottomTabNavigator} />
    <Drawer.Screen name='Profile' component={ProfileStackNavigator} />
  </Drawer.Navigator>
)
export const BottomTabNavigator = () => (
  <Tab.Navigator>
    <Tab.Screen name='Home' component={HomeStackNavigator} />
    <Tab.Screen name='Settings' component={SettingsStackNavigator} />
  </Tab.Navigator>
)
export const ProfileStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name='Profile' component={ProfileScreen} />
  </Stack.Navigator>
)
export const SettingsStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name='Setttings' component={SettingsScreen} />
  </Stack.Navigator>
)

export const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f4511e',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <Button
            onPress={() => alert('This is a button!')}
            title='Info'
            color='#fff'
          />
        ),
      }}
    >
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Detail' component={DetailScreen} />
    </Stack.Navigator>
  )
}
```

> App.js

```javascript
//@ts-check
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { StyleSheet } from 'react-native'

import useCachedResources from './src/hooks/useCachedResources'
import { NavigationContainer } from '@react-navigation/native'

import { MainDrawerNavigator } from './src/components/navigation'

export default function App() {
  const isLoadingComplete = useCachedResources()
  if (!isLoadingComplete) {
    return null
  } else {
    return (
      <NavigationContainer>
        <MainDrawerNavigator />
      </NavigationContainer>
    )
  }
}

const styles = StyleSheet.create({})
```
