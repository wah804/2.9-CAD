import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar as RNStatusBar
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { api, getApiUrl, setApiUrl, getToken, setToken } from './utils/api';
import StatsSection from './components/StatsSection';
import CarCard from './components/CarCard';
import ManageCarModal from './components/ManageCarModal';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

export default function App() {
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('login'); // 'login' | 'register' | 'vault'
  const [authLoading, setAuthLoading] = useState(true);

  // Collection & loading state
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // API URL config state
  const [apiUrl, setApiUrlState] = useState('');
  const [apiUrlInput, setApiUrlInput] = useState('');
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking' | 'connected' | 'error'

  // Modal visibility states
  const [isManageVisible, setIsManageVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [editingCar, setEditingCar] = useState(null);

  // Check auth session and load settings on boot
  const initializeAuth = useCallback(async () => {
    try {
      const url = await getApiUrl();
      setApiUrlState(url);
      setApiUrlInput(url);

      const token = await getToken();
      if (token) {
        setApiStatus('checking');
        try {
          const userData = await api.getMe();
          setUser(userData);
          setIsAuthenticated(true);
          setCurrentScreen('vault');
          setApiStatus('connected');
          // Start fetching car collection
          fetchCarsData();
        } catch (err) {
          console.error('Session verification failed, clearing session:', err);
          // If connection fails, but token exists, check if it's 401 or network error
          if (err.response?.status === 401) {
            await setToken(null);
            setIsAuthenticated(false);
            setCurrentScreen('login');
          } else {
            // Keep token but register error (likely offline/network)
            setApiStatus('error');
            // If offline, still allow showing Vault Screen with cached / empty state
            setIsAuthenticated(true);
            setCurrentScreen('vault');
          }
        }
      } else {
        setIsAuthenticated(false);
        setCurrentScreen('login');
      }
    } catch (err) {
      console.error('Session initialization error:', err);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Fetch cars from the active URL
  const fetchCarsData = async () => {
    setApiStatus('checking');
    try {
      const data = await api.getCars();
      setCars(data);
      setApiStatus('connected');
    } catch (err) {
      console.error('Error fetching cars:', err);
      setApiStatus('error');
      // Auto-logout if token is expired/invalid on request
      if (err.response?.status === 401) {
        handleLogout(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const url = await getApiUrl();
    setApiUrlState(url);
    await fetchCarsData();
  }, []);

  // Save new API URL
  const handleSaveSettings = async () => {
    if (!apiUrlInput.trim()) {
      Alert.alert('Invalid URL', 'Please enter a valid backend API URL.');
      return;
    }

    setLoading(true);
    setIsSettingsVisible(false);
    
    const success = await setApiUrl(apiUrlInput);
    if (success) {
      const updatedUrl = await getApiUrl();
      setApiUrlState(updatedUrl);
      setApiUrlInput(updatedUrl);
      if (isAuthenticated) {
        await fetchCarsData();
      } else {
        // Just verify connection status
        setApiStatus('checking');
        try {
          const client = axios.create({ baseURL: updatedUrl, timeout: 3000 });
          // Ping backend cars or login route (just checking availability)
          await client.get('/cars');
          setApiStatus('connected');
        } catch (e) {
          // If 401 it means server is up (requires login), so connected is true!
          if (e.response?.status === 401) {
            setApiStatus('connected');
          } else {
            setApiStatus('error');
          }
        } finally {
          setLoading(false);
        }
      }
    } else {
      Alert.alert('Error', 'Failed to save the custom URL.');
      setLoading(false);
    }
  };

  // Logout handler
  const handleLogout = useCallback(async (forced = false) => {
    await setToken(null);
    setUser(null);
    setCars([]);
    setIsAuthenticated(false);
    setCurrentScreen('login');
    if (forced) {
      Alert.alert('Session Expired', 'Your login session has expired. Please sign in again.');
    }
  }, []);

  // Delete car handler
  const handleDeleteCar = useCallback((id) => {
    Alert.alert(
      'Remove from Vault',
      'Are you sure you want to delete this car from your collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteCar(id);
              setCars((prevCars) => prevCars.filter(car => car._id !== id));
            } catch (err) {
              console.error('Failed to delete car:', err);
              if (err.response?.status === 401) {
                handleLogout(true);
              } else {
                Alert.alert('Error', 'Could not delete the car. Please check connection.');
              }
            }
          }
        }
      ]
    );
  }, [handleLogout]);

  // Add/Edit save handler
  const handleSaveCar = async (carData) => {
    try {
      if (editingCar) {
        // Edit Mode
        const updated = await api.updateCar(editingCar._id, carData);
        setCars((prevCars) => 
          prevCars.map(car => car._id === editingCar._id ? updated : car)
        );
      } else {
        // Add Mode
        const created = await api.createCar(carData);
        setCars((prevCars) => [created, ...prevCars]);
      }
      return true;
    } catch (err) {
      console.error('Error saving car:', err);
      if (err.response?.status === 401) {
        handleLogout(true);
      } else {
        Alert.alert('Error', 'Failed to save car. Please verify API availability.');
      }
      return false;
    }
  };

  const handleEditCar = useCallback((car) => {
    setEditingCar(car);
    setIsManageVisible(true);
  }, []);

  const handleAddCar = useCallback(() => {
    setEditingCar(null);
    setIsManageVisible(true);
  }, []);

  // Authentication success callbacks
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentScreen('vault');
    setLoading(true);
    fetchCarsData();
  };

  // Render car list item
  const renderCarItem = useCallback(({ item }) => (
    <CarCard 
      car={item} 
      onEdit={handleEditCar} 
      onDelete={handleDeleteCar} 
    />
  ), [handleEditCar, handleDeleteCar]);

  // Auth Loading Screen
  if (authLoading) {
    return (
      <View style={styles.splashContainer}>
        <RNStatusBar barStyle="light-content" />
        <Ionicons name="car-sport" size={80} color="#D1B875" />
        <ActivityIndicator size="large" color="#D1B875" style={{ marginTop: 24 }} />
        <Text style={styles.splashText}>Opening AutoVault...</Text>
      </View>
    );
  }

  // Unauthenticated: Login Screen
  if (!isAuthenticated && currentScreen === 'login') {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleAuthSuccess}
          onNavigateToRegister={() => setCurrentScreen('register')}
          onOpenSettings={() => setIsSettingsVisible(true)}
        />
        {/* Reuse Settings Modal */}
        <SettingsModal />
      </>
    );
  }

  // Unauthenticated: Register Screen
  if (!isAuthenticated && currentScreen === 'register') {
    return (
      <RegisterScreen
        onRegisterSuccess={handleAuthSuccess}
        onNavigateToLogin={() => setCurrentScreen('login')}
      />
    );
  }

  // Authenticated Protected View: Car Vault
  return (
    <SafeAreaView style={styles.container}>
      <RNStatusBar barStyle="light-content" />
      
      {/* Header Bar */}
      <View style={styles.header}>
        <View>
          <Text style={styles.brandTitle}>AutoVault</Text>
          <Text style={styles.brandSubtitle}>Owner: {user?.username || 'Collector'}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable 
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressedIcon]}
            onPress={() => setIsSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={20} color="#D1B875" />
          </Pressable>

          <Pressable 
            style={({ pressed }) => [styles.logoutButton, pressed && styles.pressedIcon]}
            onPress={() => handleLogout()}
          >
            <Ionicons name="log-out-outline" size={20} color="#ff6b6b" />
          </Pressable>
        </View>
      </View>

      {/* Connection status bar */}
      <View style={styles.statusBar}>
        <View style={[
          styles.statusDot, 
          apiStatus === 'connected' && styles.statusDotConnected,
          apiStatus === 'checking' && styles.statusDotChecking,
          apiStatus === 'error' && styles.statusDotError,
        ]} />
        <Text style={styles.statusText} numberOfLines={1}>
          {apiStatus === 'connected' ? 'Connected: ' : apiStatus === 'checking' ? 'Connecting...: ' : 'Disconnected: '}
          <Text style={styles.statusUrl}>{apiUrl.replace('/api', '')}</Text>
        </Text>
      </View>

      {/* Main content body */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#D1B875" />
          <Text style={styles.loadingText}>Opening the vault...</Text>
        </View>
      ) : apiStatus === 'error' && cars.length === 0 ? (
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Connection Failed</Text>
          <Text style={styles.errorSub}>Could not reach the server at the configured endpoint.</Text>
          <Text style={styles.errorUrl}>{apiUrl}</Text>
          
          <View style={styles.errorActionRow}>
            <Pressable 
              style={styles.retryButton} 
              onPress={handleRefresh}
            >
              <Text style={styles.retryButtonText}>Retry Connection</Text>
            </Pressable>
            
            <Pressable 
              style={styles.changeUrlButton} 
              onPress={() => setIsSettingsVisible(true)}
            >
              <Text style={styles.changeUrlButtonText}>Configure URL</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={cars}
          renderItem={renderCarItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={<StatsSection cars={cars} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#D1B875"
              colors={['#D1B875']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-sport-outline" size={80} color="#3A5B48" />
              <Text style={styles.emptyTitle}>Vault is Empty</Text>
              <Text style={styles.emptyText}>No premium vehicles registered. Start adding your collection.</Text>
              <Pressable style={styles.emptyAddButton} onPress={handleAddCar}>
                <Text style={styles.emptyAddButtonText}>Add First Car</Text>
              </Pressable>
            </View>
          }
        />
      )}

      {/* Floating Action Button (FAB) */}
      <Pressable 
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={handleAddCar}
      >
        <Ionicons name="add" size={28} color="#162019" />
      </Pressable>

      {/* Add/Edit Car Modal */}
      <ManageCarModal
        visible={isManageVisible}
        onClose={() => setIsManageVisible(false)}
        onSave={handleSaveCar}
        car={editingCar}
      />

      {/* Settings / API Endpoint Modal */}
      <SettingsModal />

      <StatusBar style="light" />
    </SafeAreaView>
  );

  // Settings Modal Sub-component helper
  function SettingsModal() {
    return (
      <Modal
        visible={isSettingsVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsSettingsVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.keyboardView}
            >
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>API Endpoint Configuration</Text>
                  <Pressable 
                    onPress={() => setIsSettingsVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={24} color="#A3B5AA" />
                  </Pressable>
                </View>

                <View style={styles.formContainer}>
                  <Text style={styles.label}>Backend Base URL</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. http://192.168.1.100:4000"
                    placeholderTextColor="rgba(232, 235, 233, 0.3)"
                    value={apiUrlInput}
                    onChangeText={setApiUrlInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                  />
                  <Text style={styles.helperText}>
                    Use localhost or loopback (10.0.2.2) for emulators, or your host IP (e.g. 192.168.1.x) or production URL for real devices.
                  </Text>

                  <View style={styles.actionRow}>
                    <Pressable
                      style={styles.cancelButton}
                      onPress={() => setIsSettingsVisible(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>

                    <Pressable
                      style={styles.submitButton}
                      onPress={handleSaveSettings}
                    >
                      <Text style={styles.submitButtonText}>Save Endpoint</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#162019',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#162019',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    color: '#A3B5AA',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight + 8 : 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2B4536',
  },
  brandTitle: {
    color: '#D1B875',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    color: '#A3B5AA',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(209, 184, 117, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(209, 184, 117, 0.2)',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.2)',
  },
  pressedIcon: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(43, 69, 54, 0.4)',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusDotConnected: {
    backgroundColor: '#52c41a',
  },
  statusDotChecking: {
    backgroundColor: '#faad14',
  },
  statusDotError: {
    backgroundColor: '#ff4d4f',
  },
  statusText: {
    color: '#A3B5AA',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  statusUrl: {
    color: '#E8EBE9',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#A3B5AA',
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    color: '#E8EBE9',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    color: '#A3B5AA',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAddButton: {
    backgroundColor: '#D1B875',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyAddButtonText: {
    color: '#162019',
    fontSize: 15,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#D1B875',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  fabPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.9,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    color: '#E8EBE9',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSub: {
    color: '#A3B5AA',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  errorUrl: {
    color: '#ff6b6b',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  retryButton: {
    flex: 0.48,
    backgroundColor: 'rgba(209, 184, 117, 0.1)',
    borderWidth: 1,
    borderColor: '#D1B875',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#D1B875',
    fontWeight: 'bold',
    fontSize: 14,
  },
  changeUrlButton: {
    flex: 0.48,
    backgroundColor: '#D1B875',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  changeUrlButtonText: {
    color: '#162019',
    fontWeight: 'bold',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 32, 25, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  keyboardView: {
    width: '100%',
  },
  modalContent: {
    backgroundColor: '#162019',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A5B48',
    width: '100%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#2B4536',
  },
  modalTitle: {
    color: '#E8EBE9',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  formContainer: {
    padding: 24,
  },
  label: {
    color: '#D1B875',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: 'rgba(43, 69, 54, 0.3)',
    borderWidth: 1,
    borderColor: '#3A5B48',
    borderRadius: 12,
    color: '#E8EBE9',
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  helperText: {
    color: '#A3B5AA',
    fontSize: 12,
    marginTop: 8,
    lineHeight: 16,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 0.45,
    backgroundColor: 'rgba(255, 107, 107, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  submitButton: {
    flex: 0.5,
    backgroundColor: '#D1B875',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  submitButtonText: {
    color: '#162019',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
