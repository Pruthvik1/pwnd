import React from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { ScreenContainer } from "@/components/common/ScreenContainer";
import { theme } from "@/constants/theme";
import { useCreateBounty } from "@/hooks/useBounties";
import { BountyStatus, PlatformType, Severity, VulnerabilityType } from "@/types";

export function AddBountyScreen() {
  const navigation = useNavigation<any>();
  const createBounty = useCreateBounty();

  const [companyName, setCompanyName] = React.useState("");
  const [companyEmail, setCompanyEmail] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [pocNotes, setPocNotes] = React.useState("");
  const [gmailThreadId, setGmailThreadId] = React.useState("");
  const [bountyExpected, setBountyExpected] = React.useState("0");
  const [reportedDate, setReportedDate] = React.useState(new Date().toISOString().slice(0, 10));
  const [severity, setSeverity] = React.useState<Severity>("medium");
  const [platform, setPlatform] = React.useState<PlatformType>("web");
  const [vulnerabilityType, setVulnerabilityType] = React.useState<VulnerabilityType>("XSS");
  const [status] = React.useState<BountyStatus>("reported");

  const onSave = async () => {
    if (!companyName.trim() || !title.trim()) {
      Alert.alert("Missing fields", "Company name and report title are required.");
      return;
    }

    try {
      await createBounty.mutateAsync({
        company_name: companyName.trim(),
        company_email: companyEmail.trim() || null,
        title: title.trim(),
        description: description.trim() || null,
        poc_notes: pocNotes.trim() || null,
        gmail_thread_id: gmailThreadId.trim() || null,
        bounty_expected: Number(bountyExpected) || 0,
        reported_at: reportedDate ? new Date(reportedDate).toISOString() : new Date().toISOString(),
        severity,
        platform,
        vulnerability_type: vulnerabilityType,
        status,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Please try again.");
    }
  };

  const fieldStyle = styles.input;

  return (
    <ScreenContainer>
      <Text style={styles.title}>Add Bounty</Text>

      <TextInput
        placeholder="Company name"
        style={fieldStyle}
        value={companyName}
        onChangeText={setCompanyName}
      />
      <TextInput
        placeholder="Company security email"
        style={fieldStyle}
        value={companyEmail}
        onChangeText={setCompanyEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Report title"
        style={fieldStyle}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Description"
        style={[fieldStyle, styles.multiLine]}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        placeholder="POC notes"
        style={[fieldStyle, styles.multiLine]}
        value={pocNotes}
        onChangeText={setPocNotes}
        multiline
      />
      <TextInput
        placeholder="Gmail thread ID (optional)"
        style={fieldStyle}
        value={gmailThreadId}
        onChangeText={setGmailThreadId}
      />
      <TextInput
        placeholder="Bounty expected"
        style={fieldStyle}
        value={bountyExpected}
        onChangeText={setBountyExpected}
        keyboardType="numeric"
      />
      <TextInput
        placeholder="Reported date (YYYY-MM-DD)"
        style={fieldStyle}
        value={reportedDate}
        onChangeText={setReportedDate}
      />

      <Text style={styles.label}>Severity</Text>
      <TextInput
        style={fieldStyle}
        value={severity}
        onChangeText={(value) => setSeverity(value as Severity)}
      />

      <Text style={styles.label}>Platform</Text>
      <TextInput
        style={fieldStyle}
        value={platform}
        onChangeText={(value) => setPlatform(value as PlatformType)}
      />

      <Text style={styles.label}>Vulnerability type</Text>
      <TextInput
        style={fieldStyle}
        value={vulnerabilityType}
        onChangeText={(value) => setVulnerabilityType(value as VulnerabilityType)}
      />

      <Pressable style={styles.button} onPress={onSave} disabled={createBounty.isPending}>
        <Text style={styles.buttonText}>
          {createBounty.isPending ? "Saving..." : "Save Bounty"}
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: "700",
  },
  label: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.white,
  },
  multiLine: {
    minHeight: 88,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    color: theme.colors.white,
    fontWeight: "700",
  },
});
