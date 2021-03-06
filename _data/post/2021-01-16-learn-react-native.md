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

These two files show how it's done.

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

# State

let's use hooks (useContext and useReducer) to provide global state management. Create a component to do most of the work.

> src/context/user-profile-context.js

```javascript
import React, { createContext, useReducer } from 'react'

const initialState = {
  username: 'unknown',
  email: '',
  authenticated: false,
  photoUrl: '/anonymous.jpg',
}
const userProfileContext = createContext(initialState)

const UserProfileProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'login': {
        const newState = {
          ...state,
          username: action.payload.username,
          authenticated: true,
        }
        return newState
      }
      case 'logout':
        return { ...initialState }
      default:
        throw new Error()
    }
  }, initialState)

  return (
    <userProfileContext.Provider value={{ state, dispatch }}>
      {children}
    </userProfileContext.Provider>
  )
}

export { userProfileContext, UserProfileProvider }
```

Now wrap the App with our provider

> App.js

```javascript
//@ts-check
import React from 'react'
...
import { UserProfileProvider } from './src/context/user-profile-context'

export default function App() {
  const isLoadingComplete = useCachedResources()
  if (!isLoadingComplete) {
    return null
  } else {
    return (
      <UserProfileProvider>
        <NavigationContainer>
          <MainDrawerNavigator />
        </NavigationContainer>
      </UserProfileProvider>
    )
  }
}

const styles = StyleSheet.create({})
```

And finally, use it in the Profile screen by adding two buttons.

> src/screens/profile.js

```javascript
import React, { useContext } from 'react'
import { Button, Text, View, StyleSheet } from 'react-native'
import { userProfileContext } from '../context/user-profile-context'

export default function ProfileScreen({ navigation }) {
  const { state: userProfile, dispatch } = useContext(userProfileContext)
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile Screen</Text>
      {!userProfile.authenticated && (
        <Button
          title='Login'
          onPress={() =>
            dispatch({
              type: 'login',
              payload: { username: 'James' },
            })
          }
        />
      )}
      {userProfile.authenticated && (
        <>
          <Text style={styles.title}>Hello {userProfile.username}</Text>
          <Button title='Logout' onPress={() => dispatch({ type: 'logout' })} />
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})
```

# Persistent Storage

Let's save some data to local storage so we can pull it back when we restart the app. We will put the code in a custom hook.

> /src/hooks/use-hooks.js

```javascript
import { useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export default function usePlan() {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  async function getPlan() {
    try {
      setIsLoading(true)
      const value = await AsyncStorage.getItem('@plan')
      setValue(value == null ? 'community' : value)
    } catch (e) {
      setError(e)
    } finally {
      setIsLoading(false)
    }
  }
  async function setPlan(value) {
    try {
      const theme = await AsyncStorage.setItem('@plan', value)
      setValue(value)
    } catch (e) {
      setError(e)
    }
  }

  useEffect(() => {
    getPlan()
  }, [])

  return [value, error, isLoading, setPlan]
}
```

Now lets use the hook in the Settings screen.

> src/screens/settings-screen.js

```javascript
import * as React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import usePlan from '../hooks/use-plan'
import { Picker } from '@react-native-picker/picker'

export default function SettingsScreen({ navigation }) {
  const [plan, planError, planIsLoading, setPlan] = usePlan()
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings Screen</Text>
      <Text>Your plan is {planIsLoading ? 'loading' : plan}</Text>
      <Text style={styles.title}>Choose a plan</Text>
      <Picker
        selectedValue={plan}
        style={{ height: 100, width: 200 }}
        onValueChange={(itemValue, itemIndex) => setPlan(itemValue)}
      >
        <Picker.Item label='Community' value='community' />
        <Picker.Item label='Developer' value='developer' />
        <Picker.Item label='Pro' value='pro' />
      </Picker>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
})
```

# Add a Map

Maps in iOS are easier to setup so let's try that.

```shell
yarn add react-native-maps
```

Create a Map screen

> /src/screens/map-screen.js

```javascript
import * as React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import MapView, { Marker } from 'react-native-maps'

const oxfordPoint = { latitude: 42.82473, longitude: -83.26499 }
export default function MapScreen() {
  return (
    <View style={styles.container}>
      <MapView
        mapType={Platform.OS == 'android' ? 'none' : 'standard'}
        camera={{
          center: oxfordPoint,
          altitude: 200 * 10000,
          pitch: 0,
          heading: 0,
          zoom: 200,
        }}
        style={styles.map}
        showsUserLocation={true}
      >
        <Marker
          key={1}
          coordinate={oxfordPoint}
          title='Oxford'
          description='Where I live'
        />
      </MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
})
```

Now add a button to the Home Screen that will take us to the Map Screen

> /src/screens/home-screen.js

```javascript
      ...
      <Text style={styles.title}>Home Screen</Text>
      <Button title='Go to Map' onPress={() => navigation.navigate('Map')} />
      <Button
      ...
```

Now add our new Map Screen to the HomeStackNavigator stack.

> /src/components/navigation.js

```javascript
...
export const HomeStackNavigator = () => {
  return (
    <Stack.Navigator
      ... option here
    >
      <Stack.Screen name='Home' component={HomeScreen} />
      <Stack.Screen name='Detail' component={DetailScreen} />
      <Stack.Screen name='Map' component={MapScreen} />
    </Stack.Navigator>
  )
}
...
```
