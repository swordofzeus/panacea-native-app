import React from "react";
import { View, StyleSheet, Text, FlatList, TouchableOpacity, Alert } from "react-native";

const QuestionnaireScreen = ({ route, navigation }) => {
  const { medication_name, questions } = route.params?.data || {};
  console.log()

  if (!medication_name || !questions) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No data available for the questionnaire.</Text>
      </View>
    );
  }

  const handleAnswerPress = (question, answer) => {
    Alert.alert(`Answer Selected`, `You answered "${answer}" for "${question}"`);
  };

  const renderQuestion = ({ item }) => (
    <View style={styles.questionContainer}>
      <Text style={styles.questionText}>{item.question}</Text>
      <View style={styles.answersContainer}>
        {item.answers.map((answer, index) => (
          <TouchableOpacity
            key={index}
            style={styles.answerButton}
            onPress={() => handleAnswerPress(item.question, answer)}
          >
            <Text style={styles.answerText}>{answer}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication: {medication_name}</Text>
      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  questionContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  questionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  answersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  answerButton: {
    backgroundColor: "#6200EE",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: "48%", // Ensure two buttons per row
  },
  answerText: {
    color: "#fff",
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default QuestionnaireScreen;
