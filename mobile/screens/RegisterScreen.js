import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api, setToken } from '../utils/api';

export default function RegisterScreen({ onRegisterSuccess, onNavigateToLogin }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    setError('');
    
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all registration fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const data = await api.register(username.trim(), email.trim(), password);
      await setToken(data.token);
      onRegisterSuccess(data.user);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please check connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaWrapper>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* Header / Brand */}
            <View style={styles.brandContainer}>
              <Ionicons name="car-sport" size={64} color="#D1B875" style={styles.logo} />
              <Text style={styles.brandTitle}>AutoVault</Text>
              <Text style={styles.brandSubtitle}>Secure Collection Management</Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create Account</Text>
              
              {error ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={18} color="#ff6b6b" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Username Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Username</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="person-outline" size={20} color="#A3B5AA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. SpeedDemon"
                    placeholderTextColor="rgba(232, 235, 233, 0.3)"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#A3B5AA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. driver@autovault.com"
                    placeholderTextColor="rgba(232, 235, 233, 0.3)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#A3B5AA" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Min. 6 characters"
                    placeholderTextColor="rgba(232, 235, 233, 0.3)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#A3B5AA" 
                    />
                  </Pressable>
                </View>
              </View>

              {/* Sign Up Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  loading && styles.submitButtonDisabled,
                  pressed && styles.submitButtonPressed
                ]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#162019" />
                ) : (
                  <Text style={styles.submitButtonText}>Create Account</Text>
                )}
              </Pressable>

              {/* Toggle Route */}
              <View style={styles.toggleRow}>
                <Text style={styles.toggleText}>Already have an account?</Text>
                <Pressable onPress={onNavigateToLogin}>
                  <Text style={styles.toggleLink}>Sign In</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaWrapper>
    </TouchableWithoutFeedback>
  );
}

function SafeAreaWrapper({ children }) {
  return (
    <View style={styles.safeContainer}>
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#162019',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    marginBottom: 12,
  },
  brandTitle: {
    color: '#D1B875',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#A3B5AA',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: 'rgba(43, 69, 54, 0.4)',
    borderWidth: 1,
    borderColor: '#2B4536',
    borderRadius: 24,
    padding: 24,
    width: '100%',
  },
  formTitle: {
    color: '#E8EBE9',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: '#D1B875',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#162019',
    borderWidth: 1,
    borderColor: '#3A5B48',
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#E8EBE9',
    fontSize: 16,
    paddingVertical: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: '#D1B875',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 10,
    shadowColor: '#D1B875',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 3,
      }
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.95,
  },
  submitButtonText: {
    color: '#162019',
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  toggleText: {
    color: '#A3B5AA',
    fontSize: 14,
  },
  toggleLink: {
    color: '#D1B875',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
