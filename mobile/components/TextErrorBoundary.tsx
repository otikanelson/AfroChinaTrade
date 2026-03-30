import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TextErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error details
    console.error(`TextErrorBoundary caught an error in ${this.props.componentName || 'Unknown Component'}:`, error);
    console.error('Error Info:', errorInfo);
    
    // Check if it's a text rendering error
    if (error.message && error.message.includes('Text strings must be rendered within a <Text> component')) {
      console.error('🚨 TEXT RENDERING ERROR DETECTED in:', this.props.componentName || 'Unknown Component');
      console.error('Stack trace:', error.stack);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Error in {this.props.componentName || 'Component'}
          </Text>
          <Text style={styles.errorDetails}>
            {this.state.error?.message || 'Unknown error'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    padding: 16,
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    margin: 8,
  },
  errorText: {
    color: '#d32f2f',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorDetails: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
});