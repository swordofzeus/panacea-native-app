import React from "react";
import { VictoryChart, VictoryBar, VictoryAxis, VictoryTheme, VictoryGroup, VictoryTooltip } from "victory";

const GroupedBarChartStyled = () => {
  const data = [
    { dosage: "1 mg", group: "Elderly", value: 33.4 },
    { dosage: "1 mg", group: "Non-elderly", value: 0 },
    { dosage: "2 mg", group: "Elderly", value: 33.7 },
    { dosage: "2 mg", group: "Non-elderly", value: 35.1 },
    { dosage: "3 mg", group: "Elderly", value: 0 },
    { dosage: "3 mg", group: "Non-elderly", value: 31.2 },
  ];

  const elderlyData = data.filter((d) => d.group === "Elderly");
  const nonElderlyData = data.filter((d) => d.group === "Non-elderly");

  return (
    <VictoryChart
      theme={VictoryTheme.material}
      domainPadding={{ x: 60 }}
      style={{ parent: { maxWidth: "90%", margin: "0 auto" } }}
    >
      <VictoryAxis
        tickValues={["1 mg", "2 mg", "3 mg"]}
        label="Dosage"
        style={{
          axis: { stroke: "#756f6a" },
          axisLabel: { fontSize: 14, padding: 30, fill: "#4a4a4a" },
          tickLabels: { fontSize: 12, padding: 5, fill: "#4a4a4a" },
        }}
      />
      <VictoryAxis
        dependentAxis
        label="Change in Sleep Latency (minutes)"
        style={{
          axis: { stroke: "#756f6a" },
          axisLabel: { fontSize: 14, padding: 40, fill: "#4a4a4a" },
          grid: { stroke: "#e0e0e0", strokeDasharray: "4" },
          tickLabels: { fontSize: 12, padding: 5, fill: "#4a4a4a" },
        }}
      />
      <VictoryGroup
        offset={30} // Increase offset slightly for better spacing
        colorScale={["#5B6ABF", "#7E87C5"]} // Updated blue/purple color palette
      >
        <VictoryBar
          data={elderlyData}
          x="dosage"
          y="value"
          labels={({ datum }) => `${datum.value}`}
          labelComponent={
            <VictoryTooltip
              flyoutStyle={{ fill: "white", stroke: "#ccc" }}
              style={{ fontSize: 10 }}
            />
          }
          barWidth={30} // Wider bars
          cornerRadius={6} // Rounded corners
        />
        <VictoryBar
          data={nonElderlyData}
          x="dosage"
          y="value"
          labels={({ datum }) => `${datum.value}`}
          labelComponent={
            <VictoryTooltip
              flyoutStyle={{ fill: "white", stroke: "#ccc" }}
              style={{ fontSize: 10 }}
            />
          }
          barWidth={30} // Wider bars
          cornerRadius={6} // Rounded corners
        />
      </VictoryGroup>
    </VictoryChart>
  );
};

export default GroupedBarChartStyled;
