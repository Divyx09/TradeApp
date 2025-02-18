import React from 'react';
import { View, Text, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useState,useEffect } from 'react';

const CandleChart = ({symbol}) => { 

    const [stockData,setStockData] = useState([]);
  
    //fetch historical data from api to make chart
    useEffect(() => {
      const fetchStockData = async () => {
        try {
          // Yahoo Finance API endpoint
          const response = await fetch(
            `http://192.168.1.4:5000/api/stocks/historical/${symbol}?period=1m&interval=1d`
          );
          const data = await response.json();
  
          // Format data (Ensure data is mapped correctly)
          const formattedData = data.map((item) => ({
            date: item.timestamp.slice(8,10), // Date of the stock price
            open: item.open, // Open price
            high: item.high, // Highest price
            low: item.low, // Lowest price
            close: item.close, // Closing price
          }));

          console.log(formattedData);
  
          setStockData(formattedData);
          // setLoading(false);
        } catch (error) {
          console.error("Error fetching stock data:", error);
          // setLoading(false);
        }
      }

      fetchStockData();

      const interval = setInterval(fetchStockData, 60000);

      return () => clearInterval(interval)

    },[symbol]);

  if (!stockData || stockData.length === 0) {
    return <Text>No Data Available</Text>;
  }

  const chartData = {
    labels: stockData.map(item => item.date), // X-axis (dates)
    datasets: [
      {
        data: stockData.map(item => item.close), // Y-axis (closing prices)
        color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View>
    <ScrollView horizontal>
      <View>
        <Text style={{marginLeft:2}}>Closing Price</Text>
        <LineChart
          data={chartData}
          width={Dimensions.get("window").width * 2.0} // Dynamic width
          height={280}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
          }}
          bezier
        />
        
      </View>
    </ScrollView>
    <Text style={{marginLeft:'45%',marginTop:-20,width:'100%',textAlign:'center'}}>Date</Text>
    </View>
  );
};

export default CandleChart;
