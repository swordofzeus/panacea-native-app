import React from "react";
import { View, Text, StyleSheet } from "react-native";
import CardComponent from "./Card";

const StudyInfoCard = ({ studyInfo, participants }) => {
  if (!studyInfo) return null;
  console.log({studyInfo})

  return (
    <CardComponent title="Study Information" description={studyInfo.summary || "No summary available"}>
      <View style={styles.studyInfoContainer}>
        <Text style={styles.infoLine}>
          <Text style={styles.bold}>Title:</Text> {studyInfo.title}
        </Text>
        <Text style={styles.infoLine}>
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.bold}>Institution:</Text> {studyInfo.organization}
        </Text>
        <Text style={styles.infoLine}>
          <Text style={styles.bold}>Dates:</Text> {studyInfo.dates.start} - {studyInfo.dates.completion}
        </Text>
        {participants && (
          <>
            <Text style={styles.highlightedLine}>
              <Text style={styles.bold}>Total Participants:</Text> {participants.total}
            </Text>
            {participants.demographics?.dropoutRate && (
              <Text style={styles.highlightedLine}>
                <Text style={styles.bold}>Dropout Rate:</Text> {(participants.demographics.dropoutRate * 100).toFixed(1)}%
              </Text>
            )}
          </>
        )}
      </View>
    </CardComponent>
  );
};

const styles = StyleSheet.create({
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

export default StudyInfoCard;
