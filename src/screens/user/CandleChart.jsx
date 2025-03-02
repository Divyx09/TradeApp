import React, { useState, useEffect } from "react";
import { View, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import { Text } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import { API_URL } from "../../config/urls";

const CandleChart = ({ symbol, timeFrame }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (date, timeFrame) => {
    switch (timeFrame) {
      case "1d":
        return date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      case "5d":
        return `${date.getDate()}/${date.getMonth() + 1}`;
      case "1mo":
        return date.toLocaleDateString([], { day: "numeric", month: "short" });
      case "6mo":
      case "1y":
        return date.toLocaleDateString([], { month: "short" });
      case "5y":
        return date.getFullYear().toString().slice(2);
      default:
        return date.toLocaleDateString([], { month: "short" });
    }
  };

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `${API_URL}/stocks/chart/${symbol}?range=${timeFrame}`,
        );
        const data = await response.json();

        if (!data || data.length === 0) {
          setError("No data available");
          return;
        }

        // Calculate how many labels to show based on screen width
        const screenWidth = Dimensions.get("window").width;
        const maxLabels = Math.floor((screenWidth - 64) / 50); // Account for padding and label width
        const step = Math.ceil(data.length / maxLabels);

        const formattedData = {
          labels: data.map((item, index) => {
            const date = new Date(item.timestamp);
            // Only show label if it's at a step interval
            return index % step === 0 ? formatDate(date, timeFrame) : "";
          }),
          datasets: [
            {
              data: data.map((item) => item.close),
              color: (opacity = 1) => `rgba(0, 180, 216, ${opacity})`,
              strokeWidth: 2,
            },
          ],
        };

        setChartData(formattedData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
        setError("Failed to load chart data");
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [symbol, timeFrame]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size='large' color='#00B4D8' />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!chartData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No data available</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get("window").width;

  return (
    <View style={styles.container}>
      <LineChart
        data={chartData}
        width={screenWidth - 32}
        height={380}
        yAxisLabel={symbol.endsWith(".NS") ? "₹" : "$"}
        chartConfig={{
          backgroundColor: "#2A2A2A",
          backgroundGradientFrom: "#2A2A2A",
          backgroundGradientTo: "#2A2A2A",
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(0, 180, 216, ${opacity})`,
          labelColor: () => "#B0B0B0",
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: "2",
            strokeWidth: "1",
            stroke: "#00B4D8",
          },
          propsForBackgroundLines: {
            stroke: "#404040",
            strokeDasharray: "",
          },
          propsForLabels: {
            fontSize: 10,
            fill: "#B0B0B0",
          },
          paddingRight: 32,
          paddingLeft: 16,
        }}
        bezier
        style={styles.chart}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withDots={true}
        withInnerLines={true}
        withOuterLines={true}
        withVerticalLines={true}
        segments={5}
        formatYLabel={(value) => {
          const num = parseFloat(value);
          if (num >= 1000) {
            return (num / 1000).toFixed(1) + "k";
          }
          return num.toFixed(1);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    alignItems: "center",
    height: 380,
    paddingTop: 8,
  },
  chart: {
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    minHeight: 300,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    minHeight: 300,
  },
  errorText: {
    color: "#FF4444",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#2A2A2A",
    minHeight: 300,
  },
  emptyText: {
    color: "#B0B0B0",
    fontSize: 14,
  },
});

export default CandleChart;
