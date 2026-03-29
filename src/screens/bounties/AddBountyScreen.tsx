import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { theme } from "@/constants/theme";
import { useCreateBounty } from "@/hooks/useBounties";
import { BountyStatus, PlatformType, Severity, VulnerabilityType } from "@/types";

const SEVERITIES: Severity[] = ["critical", "high", "medium", "low"];
const PLATFORMS: PlatformType[] = ["web", "mobile", "api", "other"];
const VULN_TYPES: VulnerabilityType[] = [
  "XSS",
  "SQLi",
  "IDOR",
  "SSRF",
  "RCE",
  "Auth Bypass",
  "Other",
];
const SEVERITY_COLORS: Record<Severity, string> = {
  critical: "#dc2626",
  high: "#ea580c",
  medium: "#d97706",
  low: "#16a34a",
};

function PillSelector<T extends string>({
  label,
  options,
  value,
  onChange,
  colorMap,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (v: T) => void;
  colorMap?: Record<string, string>;
}) {
  return (
    <View style={ps.wrap}>
      <Text style={ps.label}>{label}</Text>
      <View style={ps.row}>
        {options.map((opt) => {
          const active = opt === value;
          const color = colorMap?.[opt] ?? theme.colors.primary;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[ps.pill, active && { backgroundColor: color, borderColor: color }]}
            >
              <Text style={[ps.pillText, active && ps.pillTextActive]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const ps = StyleSheet.create({
  wrap: { gap: 6 },
  label: { color: theme.colors.muted, fontSize: 12, fontWeight: "600", textTransform: "uppercase" },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: theme.colors.white,
  },
  pillText: { color: theme.colors.muted, fontSize: 13, fontWeight: "600" },
  pillTextActive: { color: "#fff" },
});

export function AddBountyScreen() {
  const navigation = useNavigation<any>();
  const createBounty = useCreateBounty();

  const [companyName, setCompanyName] = React.useState("");
  const [companyEmail, setCompanyEmail] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [pocNotes, setPocNotes] = React.useState("");
  const [bountyExpected, setBountyExpected] = React.useState("0");
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
        bounty_expected: Number(bountyExpected) || 0,
        reported_at: new Date().toISOString(),
        severity,
        platform,
        vulnerability_type: vulnerabilityType,
        status,
      });
      navigation.goBack();
    } catch (error: unknown) {
      const e = error as { message?: string; code?: string; details?: string };
      Alert.alert("Save failed", e?.message ?? "Unknown error");
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Add Bounty</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Company</Text>
        <TextInput
          placeholder="Company name *"
          style={styles.input}
          value={companyName}
          onChangeText={setCompanyName}
        />
        <TextInput
          placeholder="Security email (optional)"
          style={styles.input}
          value={companyEmail}
          onChangeText={setCompanyEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Report</Text>
        <TextInput
          placeholder="Report title *"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          placeholder="Description"
          style={[styles.input, styles.multiLine]}
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <TextInput
          placeholder="POC notes"
          style={[styles.input, styles.multiLine]}
          value={pocNotes}
          onChangeText={setPocNotes}
          multiline
        />
        <TextInput
          placeholder="Expected bounty ($)"
          style={styles.input}
          value={bountyExpected}
          onChangeText={setBountyExpected}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <PillSelector
          label="Severity"
          options={SEVERITIES}
          value={severity}
          onChange={setSeverity}
          colorMap={SEVERITY_COLORS}
        />
      </View>

      <View style={styles.section}>
        <PillSelector
          label="Platform"
          options={PLATFORMS}
          value={platform}
          onChange={setPlatform}
        />
      </View>

      <View style={styles.section}>
        <PillSelector
          label="Vulnerability Type"
          options={VULN_TYPES}
          value={vulnerabilityType}
          onChange={setVulnerabilityType}
        />
      </View>

      <Pressable style={styles.button} onPress={onSave} disabled={createBounty.isPending}>
        <Text style={styles.buttonText}>
          {createBounty.isPending ? "Saving..." : "Save Bounty"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: theme.colors.surface },
  container: { padding: 20, gap: 16, paddingBottom: 48 },
  title: { fontSize: 24, color: theme.colors.primary, fontWeight: "800" },
  section: {
    backgroundColor: theme.colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 14,
    gap: 10,
  },
  sectionLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.colors.surface,
    fontSize: 15,
    color: theme.colors.text,
  },
  multiLine: { minHeight: 80, textAlignVertical: "top" },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
});
