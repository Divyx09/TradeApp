import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Text, Card } from 'react-native-paper';
import { LineChart } from 'react-native-chart-kit';
import { WebView } from 'react-native-webview';

const screenWidth = Dimensions.get('window').width;

const chartConfig = {
  backgroundGradientFrom: '#1E2923',
  backgroundGradientTo: '#08130D',
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
};

const mockData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // optional
      strokeWidth: 2, // optional
    },
  ],
  legend: ['Rainy Days'], // optional
};

const UserDashboard = ({navigation}) => {
  const [chartData, setChartData] = useState(mockData);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Simulate fetching new data
      const newData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [
          {
            data: Array.from({ length: 6 }, () => Math.floor(Math.random() * 100)),
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            strokeWidth: 2,
          },
        ],
        legend: ['Rainy Days'],
      };
      setChartData(newData);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge">Market Overview</Text>
          <LineChart
            data={chartData}
            width={screenWidth - 64} // Account for padding
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
          <WebView
            style={styles.webview}
            source={{
              html: `
                <div class="tradingview-widget-container">
                  <div id="tradingview_12345"></div>
                  <script type="text/javascript" src="https://s3.tradingview.com/tv.js"></script>
                  <script type="text/javascript">
                  new TradingView.widget({
                    "width": "100%",
                    "height": 400,
                    "symbol": "NASDAQ:AAPL",
                    "interval": "D",
                    "timezone": "Etc/UTC",
                    "theme": "light",
                    "style": "1",
                    "locale": "en",
                    "toolbar_bg": "#f1f3f6",
                    "enable_publishing": false,
                    "allow_symbol_change": true,
                    "container_id": "tradingview_12345"
                  });
                  </script>
                </div>
              `
            }}
          />
        </Card.Content>
      </Card>
      
      <Card style={styles.card} onPress={()=> navigation.navigate("portfolio")}>
        <Card.Content>
          <Text variant="titleLarge">Your Portfolio Summary</Text>
          {/* Add portfolio summary components here */}
        </Card.Content>
      </Card>
      
      <Card style={styles.card} onPress={()=> navigation.navigate("recentTransection")}>
        <Card.Content>
          <Text variant="titleLarge">Recent Transactions</Text>
          {/* Add recent transactions list here */}
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  webview: {
    height: 400,
    width: '100%',
  },
  chart: {
    marginBottom: 16,
  },
});

export default UserDashboard;
