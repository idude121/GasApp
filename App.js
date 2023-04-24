import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, FlatList } from 'react-native';
import ImageViewer from './components/ImageViewer';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useRef, Component } from 'react';
import Button from './components/Button';
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library';
import React from "react";
import { DrawerItem, createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';


export default function App()  {
  SplashScreen.preventAutoHideAsync();
  setTimeout(SplashScreen.hideAsync, 2000);

  const [selectedImage, setSelectedImage] = useState(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef();
  const PlaceholderImage = require('./assets/vehicle.png')
  const Drawer = createDrawerNavigator();

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      alert('You did not select any image.');
    }
  };

  function HomeScreen({ navigation }) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.imageContainer}>
          <ImageViewer placeholderImageSource={PlaceholderImage} selectedImage={selectedImage} />
        </View>
        <View style={styles.buttonContainer}>
          <Button theme="blue" label="Change Car Image" onPress={pickImageAsync} />
        </View>
        <View style={styles.textInputContainer}>
          <Text style={styles.title}>Vehichle Mileage</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="Mileage"
            keyboardType="decimal-pad"
             />
          <Text style={styles.title}>Gallons of Gas</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="Gallons of Gas"
            keyboardType="decimal-pad"
            />
          <Text style={styles.title}>Price of Gas in Dollars Per Gallon</Text>
          <TextInput 
          style={styles.textInput} 
          placeholder="Price of Gas"
          keyboardType="decimal-pad"
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button theme="blue" label="Save" onPress={() => navigation.navigate("Results")} />
        </View>
      </SafeAreaView>
    );
  }

  function ResultsScreen({ navigation }) {
    function renderRow({ item }) {
      return (
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.title}>Odometer miles: {item.odoMiles}</Text>
            <Text style={styles.title}>Miles since last fill: {item.milesSinceLast}</Text>
            <Text style={styles.title}>MPG: {item.mpg}</Text>
            <Text style={styles.title}>Cost to fill: {item.costOfFill}</Text>
            <Text style={styles.title}>Fillup date: {item.date}</Text>
          </View>
        </View>
      );
    };

    data = [
      {
        odoMiles: 'example miles',
        milesSinceLast: 'example miles',
        mpg: 'example mpg',
        costOfFill: 'example cost',
        date: 'example date',
      },
      {
        odoMiles: 'example miles 2',
        milesSinceLast: 'example miles 2',
        mpg: 'example mpg 2',
        costOfFill: 'example cost 2',
        date: 'example date 2',
      },
    ];

    return (
      <View style={styles.container}>
        <Button theme="blue" label="Learn About MPG" onPress={() => WebBrowser.openBrowserAsync('https://learn.eartheasy.com/guides/how-to-calculate-gas-mileage/')} />
        <FlatList data={data} renderItem={renderRow} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator useLegacyImplementation initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Results" component={ResultsScreen}  />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop: 50,
    width: '100%',
    alignItems: 'center',  
  },
  textInputContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  title : {
    fontSize: 20,
    color: '#fff',
  },
  textInput: {
    height: 40,
    backgroundColor: '#fff',
    width: '80%',
    borderRadius: 10,
    padding: 10,
    margin: 10,
  },
  info: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
  },
});