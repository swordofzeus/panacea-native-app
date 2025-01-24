import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { fetchAuthSession, signIn, signUp, confirmSignUp, getCurrentUser } from 'aws-amplify/auth'; // Adjusted import for getCurrentUser

export default function LoginScreen(onLogin) {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Sign-Up
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false); // Toggle for verification screen
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { username, userId, signInDetails } = await getCurrentUser();
        console.log('Current User:', { username, userId, signInDetails });
      } catch (error) {
        console.log('No user is logged in:', error.message);
      }
    };

    fetchUser();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleLogin = async () => {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: email, password, options: {
          authFlowType: "USER_PASSWORD_AUTH",
        }
      });
      console.log(isSignedIn, nextStep);
      Alert.alert('Success', 'Login successful');
      onLogin()
      // Navigate to the authenticated route
    } catch (error) {
      console.log({ error });
      Alert.alert('Error', error.message.underlyingError || 'An error occurred during login');
      throw error
    }
  };

  const handleSignUp = async () => {
    try {
      await signUp({
        username: email,
        password,
      });
      Alert.alert('Success', 'Account created successfully! Please check your email to confirm.');
      setIsVerifying(true); // Switch to verification step
    } catch (error) {
      console.log({ error });
      Alert.alert('Error', error.message || 'An error occurred during sign-up');
      console.log((error).underlyingError);
      throw error
    }
  };

  const handleVerification = async () => {
    try {
      const username = email;
      const confirmationCode = verificationCode;
      console.log({ username, confirmationCode })
      result = await confirmSignUp({ username, confirmationCode });
      console.log("Email verified")
      console.log({ result })
      Alert.alert('Success', 'Email verified! Please log in.');
      setIsVerifying(false);
      setIsLogin(true); // Switch to login after verification
    } catch (error) {
      console.log({ error });
      Alert.alert('Error', error.message || 'Invalid verification code');
    }
  };

  return (
    <View style={styles.container}>
      {/* Company Logo */}
      <Image
        source={{
          uri: 'https://images.squarespace-cdn.com/content/v1/64e4a36859c2011894dc418a/a4d9ca8e-0e3f-414f-a8bd-58906ed17de5/horizontal.png',
        }}
        style={styles.logo}
      />

      {/* Tabs for Login and Sign-Up */}
      {!isVerifying && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, isLogin && styles.activeTab]}
            onPress={() => setIsLogin(true)}
          >
            <Text style={[styles.tabText, isLogin && styles.activeTabText]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, !isLogin && styles.activeTab]}
            onPress={() => setIsLogin(false)}
          >
            <Text style={[styles.tabText, !isLogin && styles.activeTabText]}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Login and Sign-Up Forms */}
      {!isVerifying ? (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <Button
            title={isLogin ? 'Login' : 'Sign Up'}
            onPress={isLogin ? handleLogin : handleSignUp}
          />
        </View>
      ) : (
        // Verification Form
        <View style={styles.form}>
          <Text style={styles.title}>Verify Your Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Verification Code"
            keyboardType="number-pad"
            value={verificationCode}
            onChangeText={setVerificationCode}
          />
          <Button title="Verify" onPress={handleVerification} />
          <TouchableOpacity onPress={() => setIsVerifying(false)}>
            <Text style={styles.link}>Back to Sign Up</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  logo: {
    width: 300,
    height: 100,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#007BFF',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#007BFF',
    fontWeight: 'bold',
  },
  form: {
    width: '100%',
    alignItems: 'center',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  link: {
    marginTop: 15,
    color: '#007BFF',
    textDecorationLine: 'underline',
  },
});
