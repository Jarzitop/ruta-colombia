import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

export interface CatalogOption {
  id: string;
  label: string;
}

interface CatalogPickerProps {
  label: string;
  placeholder: string;
  selectedId: string | null;
  options: CatalogOption[];
  onSelect: (id: string) => void;
  disabled?: boolean;
}

export function CatalogPicker({
  label,
  placeholder,
  selectedId,
  options,
  onSelect,
  disabled = false,
}: CatalogPickerProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.id === selectedId);
  const pick = (id: string) => {
    onSelect(id);
    setOpen(false);
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        style={[styles.trigger, disabled && styles.disabled]}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label + ': ' + (selected?.label ?? placeholder)}
        onPress={() => setOpen(true)}
      >
        <Text style={[styles.triggerText, !selected && styles.placeholder]} numberOfLines={1}>
          {selected?.label ?? placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.dialog}>
            <View style={styles.dialogHeader}>
              <Text style={styles.dialogTitle}>Selecciona {label.toLowerCase()}</Text>
              <Pressable accessibilityRole="button" onPress={() => setOpen(false)}>
                <Text style={styles.close}>Cerrar</Text>
              </Pressable>
            </View>
            {options.length === 0 ? (
              <Text style={styles.empty}>No hay opciones cubiertas en este catálogo.</Text>
            ) : (
              <FlatList
                data={options}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: item.id === selectedId }}
                    onPress={() => pick(item.id)}
                    style={[styles.option, item.id === selectedId && styles.selectedOption]}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </Pressable>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { flex: 1, minWidth: 0, gap: 3 },
  label: { fontSize: 11, fontWeight: '700', color: '#475569' },
  trigger: {
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 5,
  },
  disabled: { opacity: 0.5 },
  triggerText: { flexShrink: 1, color: '#0F172A', fontSize: 12, fontWeight: '600' },
  placeholder: { color: '#64748B', fontWeight: '400' },
  chevron: { fontSize: 15, color: '#475569' },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.55)',
    padding: 20,
    justifyContent: 'center',
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    maxHeight: '65%',
  },
  dialogHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 },
  dialogTitle: { color: '#0F172A', fontSize: 16, fontWeight: '800', flexShrink: 1 },
  close: { color: '#5B21B6', fontSize: 14, fontWeight: '700', padding: 5 },
  option: { minHeight: 48, justifyContent: 'center', paddingHorizontal: 10 },
  selectedOption: { backgroundColor: '#F3E8FF', borderRadius: 7 },
  optionText: { color: '#0F172A', fontSize: 14 },
  empty: { color: '#475569', paddingVertical: 20 },
  separator: { height: 1, backgroundColor: '#E2E8F0' },
});
