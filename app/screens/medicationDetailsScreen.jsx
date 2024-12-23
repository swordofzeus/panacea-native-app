import React from "react";
import { View, StyleSheet, Text } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import CardComponent from "../Card";
import PatientMetricsGraph from "../PatientMetricsGraph"
import AdverseEventsPieChart from "../AdverseEventsPieChart"


const adverseEventsData = [
    { event: "Dysgeusia", percentage: 36 },
    { event: "Nasopharyngitis", percentage: 22 },
    { event: "Headache", percentage: 10 },
    { event: "Somnolence", percentage: 7 },
    { event: "Dizziness", percentage: 5 },
];

    const patientMetrics = [
        {
            name: "Hours Slept",
            description: "Daily self-reported sleep duration.",
            dataPoints: [6, 7.5, 8, 5.5, 7, 6.8, 8.2],
            timeLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        {
            name: "Mood Score",
            description: "Daily mood score on a scale of 1-10.",
            dataPoints: [5, 6, 7, 6, 7.5, 8, 8.5],
            timeLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        {
            name: "Pain Index",
            description: "Daily pain score on a scale of 1-10.",
            dataPoints: [4, 3.5, 3, 2.5, 2, 2.2, 1.8],
            timeLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
    ];
    const MedicationDetailsScreen = ({ route }) => {
        const { medication } = route.params;

        return (
            <ScrollView contentContainerStyle={styles.container}>
                <CardComponent
                    title={`${medication.title}`}
                >

                    <View style={styles.studyInfoContainer}>
                    <Text>Lunesta is a sedative, used for sleep disorders. slows down brain activity and promotes sleep. Lunesta is not a benzodiazepine but it has benzodiazepine-like effects; </Text>
                    </View>
                </CardComponent>


                                <PatientMetricsGraph></PatientMetricsGraph>
                <AdverseEventsPieChart adverseEvents={adverseEventsData}></AdverseEventsPieChart>


                {/* <PatientMetricsGraph metrics={patientMetrics}></PatientMetricsGraph> */}



            </ScrollView>
        );
    };



    const styles = StyleSheet.create({
        container: {
            flexGrow: 1,
            padding: 15,
            backgroundColor: "#f9f9f9",
        },
        studyInfoContainer: {
            padding: 16,
            backgroundColor: "#f9f9f9",
            borderRadius: 8,
        },
        infoLine: {
            fontSize: 14,
            color: "#333",
            marginBottom: 8,
        },
        highlightedLine: {
            fontSize: 14,
            color: "#333",
            marginBottom: 8,
            fontWeight: "bold",
        },
        bold: {
            fontWeight: "bold",
            color: "#000",
        },
    });

    export default MedicationDetailsScreen;
