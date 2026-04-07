import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationUtils } from '../utils/navigationUtils';
import { colors } from '../theme/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Reset navigation state to prevent stuck states
    NavigationUtils.reset();
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    // Navigate to home as a safe fallback
    NavigationUtils.safeNavigate('/(tabs)/home', { replace: true });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Ionicons name="warning-outline" size={64} color= {colors.primary} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              The app encountered an unexpected error. Don't worry, your data is safe.
            </Text>
            <TouchableOpacity style={styles.button} onPress={this.handleReset}>
              <Text style={styles.buttonText}>Go to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.secondary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});