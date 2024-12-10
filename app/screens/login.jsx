import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Image } from 'react-native';

export default function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.container}>
      {/* Company Logo */}
      <Image
        source={{ uri: 'https://images.squarespace-cdn.com/content/v1/64e4a36859c2011894dc418a/a4d9ca8e-0e3f-414f-a8bd-58906ed17de5/horizontal.png' }} // Replace with your company logo URL
        style={styles.logo}
      />

      {/* Screen Title */}
      <Text style={styles.title}>Welcome Back!</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}
      <Button title="Login" onPress={() => onLogin(email, password)} />

      {/* Optional Footer */}
      <Text style={styles.footerText}>
        Don't have an account? <Text style={styles.link}>Sign up</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  footerText: {
    marginTop: 20,
    color: '#666',
    fontSize: 14,
  },
  link: {
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});
