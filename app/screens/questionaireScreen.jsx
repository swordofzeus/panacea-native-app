import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { ProgressBar } from "react-native-paper";
import { useMutation, gql } from "@apollo/client";
import client from "../apollo-client";


// GraphQL Mutation
const ADD_RESPONSES_MUTATION = gql`
  mutation AddResponses($input: AddResponsesInput!) {
    addResponses(input: $input) {
      success
      message
    }
  }
`;

const QuestionnaireScreen = ({ route }) => {
   route = {
    params: {
      data: {
        medication_name: "Lunesta",
        questions: [
          {
            id: "q1",
            question: "How many hours did you sleep?",
            inputType: "choice",
            answers: ["1-2", "2-4", "4-6", "7-8", "8+"],
          },
          {
            id: "q2",
            question: "How many times did you wake up during the night?",
            inputType: "choice",
            answers: ["None", "1-2", "3-4", "5 or more"],
          },
          {
            id: "q3",
            question: "Did you experience any side effects?",
            inputType: "text",
          },
        ],
      },
    },
  };
  const { medication_name, medication_id, questions } = route.params?.data || {   "medication_name": "Lunesta",   "medication_id": "12345",   "questions": [     {       "id": "q1",       "question": "How many hours did you sleep?",       "inputType": "choice",       "answers": ["1-2", "2-4", "4-6", "7-8", "8+"],       "askedAt": "2025-01-23T18:00:00Z"     },     {       "id": "q2",       "question": "How many times did you wake up during the night?",       "inputType": "choice",       "answers": ["None", "1-2", "3-4", "5 or more"],       "askedAt": "2025-01-23T18:10:00Z"     },     {       "id": "q3",       "question": "Did you experience any side effects?",       "inputType": "text",       "askedAt": "2025-01-23T18:20:00Z"     }   ] };
  console.log(medication_name)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // Store answers for each question
  const [selectedAnswer, setSelectedAnswer] = useState(null); // Track selected answer
  const [textInputValue, setTextInputValue] = useState(""); // Handle text input value
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [addResponses] = useMutation(ADD_RESPONSES_MUTATION);

  if (!medication_name || !questions) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No data available for the questionnaire.</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isTextInput = currentQuestion.inputType === "text";

  const handleNext = () => {
    const answer = isTextInput ? textInputValue : selectedAnswer;

    setAnswers((prev) => ({
      ...prev,
      [currentQuestionIndex]: {
        questionId: currentQuestion.id,
        answer,
        askedAt: currentQuestion.askedAt,
        respondedAt: new Date().toISOString(),
      },
    }));

    setSelectedAnswer(null); // Reset selection for next question
    setTextInputValue(""); // Reset text input for next question
    setCurrentQuestionIndex((prev) => prev + 1);
  };


  const handleSubmit = async () => {
    const batchTimestamp = new Date().toISOString(); // Generate the batch timestamp

    // Hardcoded placeholders for medicationId and metricId (replace with real values as needed)
    const medicationId = route.params?.data?.medication_id || "placeholder-medication-id";
    const metricId = route.params?.data?.metric_id || "placeholder-metric-id";

    const responseInput = questions.map((question, index) => ({
      questionId: question.id,
      answer:
        answers[index]?.answer || (index === currentQuestionIndex ? textInputValue : selectedAnswer),
      askedAt: batchTimestamp, // Use the same timestamp for all questions
      respondedAt: batchTimestamp, // Same timestamp for submission
    }));

    try {
      const input = {
        medicationId,
        metricId,
        responses: responseInput,
      };

      const result = await client.mutate({
        mutation: ADD_RESPONSES_MUTATION,
        variables: { input },
      });

      if (result.data.addResponses.success) {
        Alert.alert("Success", "Your responses have been submitted successfully!");
      } else {
        throw new Error(result.data.addResponses.message || "Unknown error occurred");
      }
    } catch (error) {
      console.error("Error submitting responses:", error);
      Alert.alert("Error", "An error occurred while submitting your responses.");
    }
  };

  return (
    <LinearGradient
      colors={["#E3FDFD", "#FFE6FA"]}
      style={styles.gradientBackground}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Medication: {medication_name}</Text>

        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>
        </View>

        {isTextInput ? (
          <TextInput
            style={styles.textInput}
            placeholder="Type your response here..."
            value={textInputValue}
            onChangeText={setTextInputValue}
          />
        ) : (
          currentQuestion.answers.map((answer, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.answerButton,
                selectedAnswer === answer && styles.selectedAnswerButton,
              ]}
              onPress={() => setSelectedAnswer(answer)}
            >
              <Text
                style={[
                  styles.answerText,
                  selectedAnswer === answer && styles.selectedAnswerText,
                ]}
              >
                {answer}
              </Text>
            </TouchableOpacity>
          ))
        )}

        <Text style={styles.progressText}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
        {/* <ProgressBar
          progress={progress}
          color="#6200EE"
          style={styles.progressBar}
        /> */}

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              currentQuestionIndex === 0 && styles.disabledButton,
            ]}
            onPress={() => setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>

          {currentQuestionIndex < questions.length - 1 ? (
            <TouchableOpacity
              style={[
                styles.navButton,
                !(selectedAnswer || (isTextInput && textInputValue)) &&
                  styles.disabledButton,
              ]}
              onPress={handleNext}
              disabled={!(selectedAnswer || (isTextInput && textInputValue))}
            >
              <Text style={styles.navButtonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.navButton,
                isSubmitting && styles.disabledButton,
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting || !(selectedAnswer || (isTextInput && textInputValue))}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.navButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  questionContainer: {
    marginBottom: 20,
    alignItems: "center",
  },
  questionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#6200EE",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginVertical: 10,
    backgroundColor: "#fff",
    color: "#333",
    alignSelf: "center",
    width: "90%",
  },
  answerButton: {
    backgroundColor: "#E6E6FA",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 5,
    alignItems: "center",
    width: "70%",
    alignSelf: "center",
  },
  selectedAnswerButton: {
    backgroundColor: "#9370DB",
  },
  answerText: {
    color: "#333",
    fontSize: 14,
    textAlign: "center",
  },
  selectedAnswerText: {
    color: "#fff",
  },
  progressText: {
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
    color: "#555",
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginTop: 10,
    backgroundColor: "#D3D3D3",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navButton: {
    backgroundColor: "#6200EE",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  navButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  disabledButton: {
    backgroundColor: "#A9A9A9",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
  },
});

export default QuestionnaireScreen;
