import React, { useState } from 'react';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import DropDownPicker from 'react-native-dropdown-picker';
import CardComponent from './Card'; // Adjust the import path

const LineChartCard = ({ metrics }) => {
  const [selectedMetric, setSelectedMetric] = useState(Object.keys(metrics)[0] || '');
  const [open, setOpen] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const renderLineChart = (selectedMetricData) => {
    const { data, lowerBound, upperBound } = selectedMetricData;

    return (
      <LineChart
        data={data}
        data2={lowerBound}
        data3={upperBound}
        curved
        isAnimated
        showVerticalLines
        hideRules={false}
        rulesColor="lightgray"
        xAxisColor="gray"
        yAxisColor="gray"
        yAxisTextStyle={{ color: '#333', fontSize: 12 }}
        xAxisTextStyle={{ color: '#333', fontSize: 12 }}
        yAxisLabelWidth={30}
        areaChart
        thickness={2.5}
        spacing={screenWidth / (data.length + 1)}
        height={250}
        width={screenWidth - 50}
        startFillColor="rgba(84, 219, 234, 1)"
        endFillColor="rgba(84, 219, 234, 1)"
        startOpacity={0.2}
        endOpacity={0.6}
        dataPointsColor="#007AFF"
        dataPointsRadius={5}
        secondaryDataColor="red"
        secondaryDataThickness={2}
        tertiaryDataColor="rgba(0, 255, 0, 0.8)"
        tertiaryDataThickness={2}
        noOfVerticalLines={data.length - 1}
      />
    );
  };

  return (
    <CardComponent title={metrics[selectedMetric]?.title || 'Select a Metric'}>
      <DropDownPicker
        open={open}
        value={selectedMetric}
        items={Object.keys(metrics).map((key) => ({
          label: key,
          value: key,
        }))}
        setOpen={setOpen}
        setValue={setSelectedMetric}
        placeholder="Select Metric"
        style={{
          backgroundColor: '#f5f5f5',
          borderColor: '#ccc',
          borderWidth: 1,
          borderRadius: 8,
          paddingHorizontal: 10,
          height: 40,
          marginBottom: 10,
        }}
        dropDownContainerStyle={{
          borderColor: '#ccc',
        }}
      />
      {metrics[selectedMetric] && renderLineChart(metrics[selectedMetric])}
    </CardComponent>
  );
};

export default LineChartCard;
