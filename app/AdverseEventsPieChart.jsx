import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { VictoryPie, VictoryLegend } from "victory";
import CardComponent from "./Card";

const AdverseEventsDonutChart = ({ adverseEvents }) => {
  if (!adverseEvents || adverseEvents.length === 0) {
    console.log(adverseEvents)
    return (
      <CardComponent title="Adverse Events">
        <Text style={styles.noDataText}>No adverse events data available.</Text>
      </CardComponent>
    );
  }

  const commonEventsData = adverseEvents.map((event) => ({
    x: event.event,
    y: event.percentage,
  }));

  return (
    <CardComponent title="Adverse Events">
      <View style={styles.container}>
        <VictoryPie
          data={commonEventsData}
          colorScale="cool"
          labels={({ datum }) => `${datum.x}\n${datum.y}%`}
          innerRadius={80} // Increased innerRadius to make the ring thinner
          labelRadius={({ radius }) => radius + 10}
          style={{
            labels: {
              fontSize: 12,
              fill: "#4a4a4a",
            },
          }}
          padAngle={2} // Adds spacing between slices for better readability
        />

      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  noDataText: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginTop: 10,
  },
});

export default AdverseEventsDonutChart;
