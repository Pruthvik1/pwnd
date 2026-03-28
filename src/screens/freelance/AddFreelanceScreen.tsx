import React from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import { useCreateFreelanceEngagement } from "@/hooks/useFreelance";

export function AddFreelanceScreen() {
  const navigation = useNavigation<any>();
  const createEngagement = useCreateFreelanceEngagement();

  const [clientName, setClientName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [expectedValue, setExpectedValue] = React.useState("");

  const onSave = () => {
    if (!clientName.trim() || !title.trim()) {
      return;
    }

    createEngagement.mutate(
      {
        client_name: clientName,
        title,
        stage: "lead",
        payment_status: "unpaid",
        expected_value: expectedValue ? Number(expectedValue) : null,
      },
      {
        onSuccess: () => {
          navigation.goBack();
        },
      },
    );
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Add freelance lead</Text>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Client name"
          value={clientName}
          onChangeText={setClientName}
        />
        <TextInput
          style={styles.input}
          placeholder="Project title"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.input}
          placeholder="Expected value"
          keyboardType="numeric"
          value={expectedValue}
          onChangeText={setExpectedValue}
        />
        <Pressable style={styles.saveButton} onPress={onSave} disabled={createEngagement.isPending}>
          <Text style={styles.saveText}>{createEngagement.isPending ? "Saving..." : "Save lead"}</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colors.primary,
  },
  formCard: {
    backgroundColor: theme.colors.white,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: theme.colors.text,
    backgroundColor: theme.colors.white,
  },
  saveButton: {
    borderRadius: 999,
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    paddingVertical: 11,
  },
  saveText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
});
