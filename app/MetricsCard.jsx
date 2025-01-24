import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BarChart, XAxis, YAxis } from "react-native-svg-charts";
import * as scale from "d3-scale";
import Card from "./Card";

const MetricsCard = ({ outcomes }) => {
  const [selectedMetric, setSelectedMetric] = useState(outcomes[0]?.metric_name || "");
  console.log({selectedMetric})
  console.log({outcomes})
  const colors = [
    "#8e44ad", // Dark Purple
    "#6c5ce7", // Light Indigo
    "#4834d4", // Deep Blue
    "#74b9ff", // Light Blue
    "#00cec9", // Teal
    "#a29bfe", // Lavender
    "#dfe6e9", // Soft Grey-Blue
    "#2d3436", // Charcoal
    "#b2bec3", // Light Slate
    "#636e72", // Dark Slate
  ];

  const metric = outcomes.find((outcome) => outcome.metric_name === selectedMetric);

  if (!metric) {
    return <Text style={styles.noDataText}>No data available for this metric</Text>;
  }

  const { data, yAxis, xAxis, summary } = metric;
  const dosageLabels = data.map((group) => group.label);
  const categories = Array.from(
    new Set(data.flatMap((group) => group.values.map((item) => item.group)))
  );

  const barData = categories.map((category, index) => ({
    data: data.map((group) =>
      group.values.find((value) => value.group === category)?.value || 0
    ),
    svg: { fill: colors[index % colors.length] },
    label: category,
  }));

  const renderTabs = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabContainer}>
      {outcomes.map((outcome) => (
        <Text
          key={outcome.metric_name}
          style={[styles.tab, selectedMetric === outcome.metric_name && styles.selectedTab]}
          onPress={() => setSelectedMetric(outcome.metric_name)}
        >
          {outcome.metric_name}
        </Text>
      ))}
    </ScrollView>
  );

  const renderLegend = () => (
    <View style={styles.legendContainer}>
      {barData.map((group, index) => (
        <View key={index} style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: group.svg.fill }]} />
          <Text style={styles.legendText}>{group.label}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <Card title="Metrics" description={summary}>
      <View style={styles.container}>
        {renderTabs()}
        <Text style={styles.chartTitle}>
          {selectedMetric} ({yAxis.unit})
        </Text>
        <View style={{ flexDirection: "row", height: 300, paddingHorizontal: 10 }}>
          <YAxis
            data={barData.flatMap((group) => group.data)}
            contentInset={{ top: 10, bottom: 10 }}
            svg={{ fontSize: 12, fill: "gray" }}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={true} style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "column",
                minWidth: Math.max(dosageLabels.length * 80, 400), // Adjusts width dynamically
              }}
            >
              <BarChart
                style={{ height: 250 }}
                data={barData}
                yAccessor={({ item }) => item}
                contentInset={{ top: 10, bottom: 10 }}
                spacingInner={0.4} // Adjusted for narrower bars within groups
                spacingOuter={0.1} // Reduced space between groups
                groupMode="grouped"
              />
              <XAxis
                style={{ marginTop: 10 }}
                data={dosageLabels}
                formatLabel={(value, index) => dosageLabels[index]}
                scale={scale.scaleBand}
                svg={{ fontSize: 12, fill: "gray" }}
              />
            </View>
          </ScrollView>
        </View>
        {renderLegend()}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  noDataText: {
    textAlign: "center",
    fontSize: 14,
    color: "gray",
    marginTop: 20,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  tab: {
    marginHorizontal: 10,
    fontSize: 16,
    color: "gray",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  selectedTab: {
    color: "#00308F",
    borderBottomWidth: 2,
    borderBottomColor: "#00308F",
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 10,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    margin: 5,
  },
  legendColorBox: {
    width: 12,
    height: 12,
    borderRadius: 2,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: "gray",
  },
  description: {
    fontSize: 14,
    color: "gray",
    textAlign: "left",
    marginTop: 10,
  },
});

export default MetricsCard;
