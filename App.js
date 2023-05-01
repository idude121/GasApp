import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Alert, FlatList, Platform } from 'react-native';
import ImageViewer from './components/ImageViewer';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useRef, Component, useEffect } from 'react';
import Button from './components/Button';
import * as ImagePicker from 'expo-image-picker'
import * as MediaLibrary from 'expo-media-library';
import React from "react";
import { DrawerItem, createDrawerNavigator } from '@react-navigation/drawer';
import { NavigationContainer } from '@react-navigation/native';
import { ScrollView } from 'react-native-gesture-handler';
import * as WebBrowser from 'expo-web-browser';
import * as SQLite from 'expo-sqlite';


const Drawer = createDrawerNavigator();
 
function openDatabase() {
  if (Platform.OS === 'web') {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }
  const db = SQLite.openDatabase('mpg.db');
  return db;
}

const db = openDatabase();

export default function App()  {
  const [forceUpdate, forceUpdateId] = useForceUpdate();
  const [mpgEntry, setMpgEntry] = useState([]);

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM mpgEntries order by id desc',
        null,
        (_, { rows: { _array } }) => setMpgEntry(_array)
      );
    });
  }, []);


  function MpgEntries({ props })  {
    const mpgEntry = props.mpgEntry;
    useEffect(() => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM mpgEntries order by id desc',
          null,
          (_, { rows: { _array } }) => setMpgEntry(_array)
        );
      });
    }, []);

    function renderRow({ item }) {
      if (!item) {
        return (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.title}>No entries yet</Text>
            </View>
          </View>
        );
      } else {
        return (
          <View style={styles.row}>
            <View style={styles.info}>
              <Text style={styles.title}>Odometer miles: {item.odoMiles}</Text>
              <Text style={styles.title}>Miles since last fill: {item.milesSinceLast}</Text>
              <Text style={styles.title}>MPG: {item.mpg}</Text>
              <Text style={styles.title}>Cost of fill: {item.costOfFill}</Text>
              <Text style={styles.title}>Date: {item.date}</Text>
            </View>
          </View>
        );
      }
    }
    
    return (
      <SafeAreaView style={styles.container}>
        <FlatList data={mpgEntry} renderItem={renderRow} />
      </SafeAreaView>
    );
  }


  SplashScreen.preventAutoHideAsync();
  setTimeout(SplashScreen.hideAsync, 2000);

  const [selectedImage, setSelectedImage] = useState(null);
  const [status, requestPermission] = MediaLibrary.usePermissions();
  const imageRef = useRef();
  const PlaceholderImage = require('./assets/vehicle.png')

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
    const [odoMiles, setOdoMiles] = useState(null);
    const [milesSinceLast, setMilesSinceLast] = useState('');
    const [mpg, setMpg] = useState('');
    const [costOfFill, setCostOfFill] = useState('');
    const [date, setDate] = useState('');
    const [gallons, setGallons] = useState(null);
    const [price, setPrice] = useState(null);

    useEffect(() => {
      db.transaction(tx => {
        tx.executeSql(
          'CREATE TABLE IF NOT EXISTS mpgEntries (id integer primary key not null, odoMiles real, milesSinceLast real, mpg real, costOfFill real, date real);'
        );
      });
    }, []);

    const saveEntry = () => {
      const odoMiles = parseFloat(odoMiles);
      const gallons = parseFloat(gallons);
      const price = parseFloat(price);
      const costOfFill = gallons * price;

      if (odoMiles === null || gallons === null || price === null) {
        Alert.alert('Please enter a valid number for mileage, gallons and price');
        return;
      }

      const date = new Date().toLocaleDateString();
      const costOfFillValue = gallons * price;
      const milesSinceLast = odoMiles - (mpgEntry[0]?.odoMiles ?? odoMiles);
      const mpgValue = milesSinceLast / gallons;
      

      db.transaction(
        (tx) => {
          tx.executeSql(
            'INSERT INTO mpgEntries (odoMiles, milesSinceLast, mpg, costOfFill, date) VALUES (?, ?, ?, ?, ?)',
            [odoMiles, milesSinceLast, mpgValue, costOfFillValue, date],
            (txObj, resultSet) => console.log(resultSet.insertId),
            (txObj, error) => console.log('Error', error)
          );
        },
        null,
        forceUpdate
      );
      setOdoMiles('');
      setGallons('');
      setPrice('');
      navigation.navigate("Results", { mpgEntry: mpgEntry });
    };

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
            returnKeyType='done'
            defaultValue={odoMiles}
            onChangeText={(odoMiles) => setOdoMiles(odoMiles)}
             />
          <Text style={styles.title}>Gallons of Gas</Text>
          <TextInput 
            style={styles.textInput} 
            placeholder="Gallons of Gas"
            keyboardType="decimal-pad"
            returnKeyType='done'
            defaultValue={gallons}
            onChangeText={(gallons) => setGallons(gallons)}
            />
          <Text style={styles.title}>Price of Gas in Dollars Per Gallon</Text>
          <TextInput 
          style={styles.textInput} 
          placeholder="Price of Gas"
          keyboardType="decimal-pad"
          returnKeyType='done'
          defaultValue={price}
          onChangeText={(price) => setPrice(price)}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button theme="blue" label="Save" onPress={saveEntry} />
        </View>
      </SafeAreaView>
    );
  }

  function ResultsScreen({ route }) {
    console.log(route);
    const mpgEntry = route.params?.mpgEntry ?? [];
    console.log(mpgEntry);
    return (
      <View style={styles.container}>
        <Button theme="blue" label="Learn About MPG" onPress={() => WebBrowser.openBrowserAsync('https://learn.eartheasy.com/guides/how-to-calculate-gas-mileage/')} />
        <MpgEntries mpgEntry={mpgEntry} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator useLegacyImplementation initialRouteName="Home">
        <Drawer.Screen name="Home" component={HomeScreen} />
        <Drawer.Screen name="Results" component={ResultsScreen} initialParams={{ mpgEntry: mpgEntry, setMpgEntry: setMpgEntry }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

function useForceUpdate() {
  const [value, setValue] = useState(0);
  return [() => setValue(value + 1), value];
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