import React, { useState, useRef } from 'react';
import { View, StyleSheet, Alert, Image } from 'react-native';
import { Text, Button, Card, FAB } from 'react-native-paper';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Card style={styles.permissionCard}>
          <Card.Content style={styles.permissionContent}>
            <MaterialIcons name="camera-alt" size={64} color="#666" />
            <Text variant="headlineSmall" style={styles.permissionTitle}>
              Camera Access Required
            </Text>
            <Text variant="bodyMedium" style={styles.permissionText}>
              CalAI needs camera access to capture photos of your food for nutrition analysis.
            </Text>
            <Button 
              mode="contained" 
              onPress={requestPermission}
              style={styles.permissionButton}
            >
              Grant Permission
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        
        if (photo) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
        console.error('Camera error:', error);
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setCapturedImage(result.assets[0].uri);
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) return;

    setAnalyzing(true);
    
    // Simulate AI analysis (replace with actual AI service)
    setTimeout(() => {
      setAnalyzing(false);
      Alert.alert(
        'Analysis Complete',
        'Food detected: Grilled Chicken Salad\nCalories: 350\nProtein: 35g\nCarbs: 12g\nFat: 18g',
        [
          { text: 'Discard', style: 'cancel' },
          { text: 'Save to Log', onPress: () => saveToLog() }
        ]
      );
    }, 2000);
  };

  const saveToLog = () => {
    // TODO: Save to Supabase
    setCapturedImage(null);
    Alert.alert('Success', 'Food entry saved to your log!');
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
        </View>
        
        <View style={styles.previewActions}>
          <Button
            mode="outlined"
            onPress={retakePicture}
            style={styles.previewButton}
            icon="camera-retake"
          >
            Retake
          </Button>
          
          <Button
            mode="contained"
            onPress={analyzeImage}
            loading={analyzing}
            disabled={analyzing}
            style={styles.previewButton}
            icon="auto-fix-high"
          >
            {analyzing ? 'Analyzing...' : 'Analyze Food'}
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
      >
        <View style={styles.cameraOverlay}>
          <View style={styles.topControls}>
            <Button
              mode="contained-tonal"
              onPress={toggleCameraFacing}
              icon="camera-flip"
              compact
            >
              Flip
            </Button>
          </View>
          
          <View style={styles.centerGuide}>
            <View style={styles.focusFrame} />
            <Text variant="bodySmall" style={styles.guideText}>
              Center your food in the frame
            </Text>
          </View>
          
          <View style={styles.bottomControls}>
            <Button
              mode="contained-tonal"
              onPress={pickImage}
              icon="image"
              style={styles.galleryButton}
            >
              Gallery
            </Button>
            
            <FAB
              icon="camera"
              onPress={takePicture}
              style={styles.captureButton}
              size="large"
            />
            
            <View style={styles.placeholder} />
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    padding: 24,
  },
  permissionCard: {
    width: '100%',
    maxWidth: 400,
  },
  permissionContent: {
    alignItems: 'center',
    padding: 32,
  },
  permissionTitle: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  permissionButton: {
    minWidth: 150,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  topControls: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 20,
    paddingTop: 60,
  },
  centerGuide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  guideText: {
    color: 'white',
    marginTop: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  galleryButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
  },
  placeholder: {
    width: 80,
  },
  previewContainer: {
    flex: 1,
  },
  previewImage: {
    flex: 1,
    width: '100%',
  },
  previewActions: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    gap: 12,
  },
  previewButton: {
    flex: 1,
  },
});