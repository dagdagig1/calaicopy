import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, Card, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/config/supabase';
import { LoadingSpinner } from '../../src/components/ui/LoadingSpinner';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  weight: number | null;
  height: number | null;
  age: number | null;
  gender: 'male' | 'female' | 'other' | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  goal: 'lose' | 'maintain' | 'gain' | null;
  daily_calorie_target: number | null;
}

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create new profile
        const newProfile: Partial<UserProfile> = {
          id: user?.id,
          email: user?.email || '',
          full_name: null,
          weight: null,
          height: null,
          age: null,
          gender: null,
          activity_level: null,
          goal: null,
          daily_calorie_target: null,
        };
        setProfile(newProfile as UserProfile);
        setEditing(true);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      // Calculate BMR and daily calorie target
      let dailyCalorieTarget = 2000; // Default
      
      if (profile.weight && profile.height && profile.age && profile.gender) {
        // Mifflin-St Jeor Equation
        let bmr;
        if (profile.gender === 'male') {
          bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
        } else {
          bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
        }

        // Activity level multiplier
        const activityMultipliers = {
          sedentary: 1.2,
          light: 1.375,
          moderate: 1.55,
          active: 1.725,
          very_active: 1.9,
        };

        const activityMultiplier = profile.activity_level 
          ? activityMultipliers[profile.activity_level] 
          : 1.2;

        dailyCalorieTarget = Math.round(bmr * activityMultiplier);

        // Adjust for goal
        if (profile.goal === 'lose') {
          dailyCalorieTarget -= 500; // 1 lb per week
        } else if (profile.goal === 'gain') {
          dailyCalorieTarget += 500; // 1 lb per week
        }
      }

      const updatedProfile = {
        ...profile,
        daily_calorie_target: dailyCalorieTarget,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updatedProfile);

      if (error) throw error;

      setProfile(updatedProfile);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut }
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text>Error loading profile</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={48} color="white" />
          </View>
          <Text variant="headlineSmall" style={styles.name}>
            {profile.full_name || 'Complete Your Profile'}
          </Text>
          <Text variant="bodyMedium" style={styles.email}>
            {profile.email}
          </Text>
        </Card.Content>
      </Card>

      {/* Basic Information */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Basic Information
            </Text>
            {!editing && (
              <Button
                mode="text"
                onPress={() => setEditing(true)}
                icon="edit"
              >
                Edit
              </Button>
            )}
          </View>

          {editing ? (
            <View style={styles.form}>
              <TextInput
                label="Full Name"
                value={profile.full_name || ''}
                onChangeText={(text) => setProfile({ ...profile, full_name: text })}
                mode="outlined"
                style={styles.input}
              />

              <View style={styles.row}>
                <TextInput
                  label="Weight (kg)"
                  value={profile.weight?.toString() || ''}
                  onChangeText={(text) => setProfile({ ...profile, weight: parseFloat(text) || null })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
                <TextInput
                  label="Height (cm)"
                  value={profile.height?.toString() || ''}
                  onChangeText={(text) => setProfile({ ...profile, height: parseFloat(text) || null })}
                  mode="outlined"
                  keyboardType="numeric"
                  style={[styles.input, styles.halfInput]}
                />
              </View>

              <TextInput
                label="Age"
                value={profile.age?.toString() || ''}
                onChangeText={(text) => setProfile({ ...profile, age: parseInt(text) || null })}
                mode="outlined"
                keyboardType="numeric"
                style={styles.input}
              />

              <Text variant="titleSmall" style={styles.sectionLabel}>
                Gender
              </Text>
              <SegmentedButtons
                value={profile.gender || ''}
                onValueChange={(value) => setProfile({ ...profile, gender: value as any })}
                buttons={[
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
                style={styles.segmentedButtons}
              />

              <Text variant="titleSmall" style={styles.sectionLabel}>
                Activity Level
              </Text>
              <SegmentedButtons
                value={profile.activity_level || ''}
                onValueChange={(value) => setProfile({ ...profile, activity_level: value as any })}
                buttons={[
                  { value: 'sedentary', label: 'Sedentary' },
                  { value: 'light', label: 'Light' },
                  { value: 'moderate', label: 'Moderate' },
                  { value: 'active', label: 'Active' },
                  { value: 'very_active', label: 'Very Active' },
                ]}
                style={styles.segmentedButtons}
              />

              <Text variant="titleSmall" style={styles.sectionLabel}>
                Goal
              </Text>
              <SegmentedButtons
                value={profile.goal || ''}
                onValueChange={(value) => setProfile({ ...profile, goal: value as any })}
                buttons={[
                  { value: 'lose', label: 'Lose Weight' },
                  { value: 'maintain', label: 'Maintain' },
                  { value: 'gain', label: 'Gain Weight' },
                ]}
                style={styles.segmentedButtons}
              />

              <View style={styles.formActions}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setEditing(false);
                    loadProfile();
                  }}
                  style={styles.actionButton}
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={saveProfile}
                  loading={saving}
                  disabled={saving}
                  style={styles.actionButton}
                >
                  Save
                </Button>
              </View>
            </View>
          ) : (
            <View style={styles.infoDisplay}>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Weight:</Text>
                <Text variant="bodyMedium">{profile.weight ? `${profile.weight} kg` : 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Height:</Text>
                <Text variant="bodyMedium">{profile.height ? `${profile.height} cm` : 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Age:</Text>
                <Text variant="bodyMedium">{profile.age || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Gender:</Text>
                <Text variant="bodyMedium">{profile.gender || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Activity Level:</Text>
                <Text variant="bodyMedium">{profile.activity_level || 'Not set'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text variant="bodyMedium" style={styles.infoLabel}>Goal:</Text>
                <Text variant="bodyMedium">{profile.goal || 'Not set'}</Text>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Daily Target */}
      <Card style={styles.card}>
        <Card.Content>
          <Text variant="titleLarge" style={styles.cardTitle}>
            Daily Target
          </Text>
          <View style={styles.targetContainer}>
            <MaterialIcons name="local-fire-department" size={32} color="#FF5722" />
            <Text variant="displaySmall" style={styles.targetCalories}>
              {profile.daily_calorie_target || 2000}
            </Text>
            <Text variant="bodyMedium" style={styles.targetLabel}>
              calories per day
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Sign Out */}
      <Card style={styles.card}>
        <Card.Content>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            icon="logout"
            textColor="#F44336"
            style={styles.signOutButton}
          >
            Sign Out
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontWeight: '600',
    marginBottom: 4,
  },
  email: {
    color: '#666',
  },
  card: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontWeight: '600',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  sectionLabel: {
    marginTop: 8,
    marginBottom: 8,
    fontWeight: '600',
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
  },
  infoDisplay: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontWeight: '500',
    color: '#666',
  },
  targetContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  targetCalories: {
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 8,
  },
  targetLabel: {
    color: '#666',
  },
  signOutButton: {
    borderColor: '#F44336',
  },
});