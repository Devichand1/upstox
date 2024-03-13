import React, {useEffect, useRef, useState} from 'react';

import {
  Animated,
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const APP_COLOR = '#7D007C';
const detailedInfo = [
  {
    title: 'Current Value:',
    key: 'totalCurrentValue',
  },
  {
    title: 'Total Investment:',
    key: 'totalInvestment',
  },
  {
    title: `Today's Profit & Loss:`,
    key: 'totalTodaysPNL',
  },
];

function App(): React.JSX.Element {
  const [list, setList] = useState([]);
  const [overAllData, setOverAllData] = useState({
    totalCurrentValue: 0,
    totalInvestment: 0,
    totalPNL: 0,
    totalTodaysPNL: 0,
  });
  const [toggleOpened, setToggleOpened] = useState(false);
  const animatedController = useRef(new Animated.Value(0)).current;
  const bodyHeight = animatedController.interpolate({
    inputRange: [0, 1],
    outputRange: [80, 180], // height ranges from 0 to 150
  });

  useEffect(() => {
    fetch('https://run.mocky.io/v3/bde7230e-bc91-43bc-901d-c79d008bddc8', {
      method: 'GET',
    })
      .then(response => response.json())
      .then(responseJson => {
        console.log(responseJson);
        setList(responseJson.userHolding);
        setOverAllData(calculateValues(responseJson.userHolding));
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  function calculateValues(userHolding) {
    let currentValues = [] as any;
    let investmentValues = [] as any;
    let todaysPNL = [] as any;

    userHolding.forEach((item: any) => {
      let currentValue = item.ltp * item.quantity;
      let investmentValue = item.avgPrice * item.quantity;
      let todayPNL = (item.close - item.ltp) * item.quantity;

      currentValues.push(currentValue);
      investmentValues.push(investmentValue);
      todaysPNL.push(todayPNL);
    });

    let totalCurrentValue = currentValues.reduce(
      (a: number, b: number) => a + b,
      0,
    );
    let totalInvestment = investmentValues.reduce(
      (a: number, b: number) => a + b,
      0,
    );
    let totalPNL = totalCurrentValue - totalInvestment;
    let totalTodaysPNL = todaysPNL.reduce((a: number, b: number) => a + b, 0);

    return {
      totalCurrentValue,
      totalInvestment,
      totalPNL,
      totalTodaysPNL,
    };
  }
  const handleChangeToggle = () => {
    Animated.timing(animatedController, {
      duration: 500,
      toValue: toggleOpened ? 0 : 1,
      useNativeDriver: false,
    }).start();

    setToggleOpened(!toggleOpened);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'light-content'} backgroundColor={APP_COLOR} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upstox Holding</Text>
      </View>
      <FlatList
        data={list}
        renderItem={({item}) => <ItemComponent data={item} />}
        keyExtractor={item => item.symbol + Math.random()}
      />
      <Animated.View style={[styles.footer, {height: bodyHeight}]}>
        <TouchableOpacity
          onPress={handleChangeToggle}
          style={toggleOpened ? styles.toggleOppened : styles.toggle}
        />
        {detailedInfo.map((item, index) => {
          return (
            <View style={styles.footerItem} key={index}>
              <Text style={styles.footerTitle}>{item.title}</Text>
              <Text style={styles.footerVal}>
                ₹ {overAllData[item.key].toFixed(2)}
              </Text>
            </View>
          );
        })}
      </Animated.View>
      <View style={styles.footerItemPnl}>
        <Text style={styles.footerTitle}>Profit & loss</Text>
        <Text style={styles.footerVal}>
          ₹ {overAllData?.totalPNL?.toFixed(2)}
        </Text>
      </View>
    </SafeAreaView>
  );
}
const ItemComponent = ({data}) => {
  const pnlValue = data?.ltp * data.quantity - data?.avgPrice * data.quantity;
  return (
    <View style={styles.itemContainer}>
      <View style={styles.body}>
        <Text style={styles.name}>{data?.symbol}</Text>
        <Text style={styles.text}>{data.quantity}</Text>
      </View>
      <View style={styles.priceContainer}>
        <Text style={styles.text}>
          LTP: <Text style={styles.boldText}> ₹ {data?.ltp}</Text>
        </Text>
        <Text style={styles.text}>
          P/L: <Text style={styles.boldText}> ₹ {pnlValue.toFixed(2)}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cfcfcf',
  },
  header: {
    backgroundColor: APP_COLOR,
    padding: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    flexDirection: 'column',
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  footerItem: {
    flexDirection: 'row',
    width: '100%',
    paddingVertical: 4,
    justifyContent: 'space-between',
  },
  footerItemPnl: {
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
  footerVal: {
    fontSize: 16,
    color: '#000',
  },
  itemContainer: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#44444488',
    borderBottomWidth: 0.5,
    backgroundColor: '#fff',
  },
  itemHeader: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  body: {
    flex: 1,
    flexDirection: 'column',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  text: {
    fontSize: 14,
    lineHeight: 21,
    color: '#000',
  },
  boldText: {
    fontWeight: '700',
  },
  toggle: {
    // create tringle
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: APP_COLOR,
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -10,
  },
  toggleOppened: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 20,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: APP_COLOR,
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -10,
  },
});

export default App;
