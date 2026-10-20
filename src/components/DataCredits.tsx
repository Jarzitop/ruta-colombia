import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import type { TransitDataset } from '../data/contract';
import { dataAttribution } from '../data/licensing';

type Props = {
  dataset: Pick<TransitDataset, 'datasetVersion' | 'sourceRefs'>;
};

/** Visible attribution for official GTFS; independent of the build channel. */
export function DataCredits({ dataset }: Props) {
  const [open, setOpen] = useState(false);
  const data = dataAttribution(dataset);
  if (!data) return null;
  return (
    <View style={styles.wrapper}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={() => setOpen((value) => !value)}
      >
        <Text style={styles.toggle}>
          {open ? 'Ocultar créditos de datos' : 'Créditos de datos y licencia CC BY-SA 4.0'}
        </Text>
      </Pressable>
      {open && (
        <View style={styles.details}>
          <Text style={styles.body}>
            Datos originales: {data.publisher}. {data.sourceTitle}.
          </Text>
          <Text style={styles.body}>{data.changes}</Text>
          <Text style={styles.body}>
            Los datos adaptados que se compartan deben cumplir las condiciones
            de atribución y CompartirIgual de CC BY-SA 4.0.
          </Text>
          <Text style={styles.body}>{data.independence}</Text>
          <Pressable accessibilityRole="link"
            onPress={() => void Linking.openURL(data.sourceUrl)}>
            <Text style={styles.link}>Abrir fuente oficial de los datos</Text>
          </Pressable>
          <Pressable accessibilityRole="link"
            onPress={() => void Linking.openURL(data.licenseUrl)}>
            <Text style={styles.link}>Consultar licencia CC BY-SA 4.0</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 4 },
  toggle: { fontSize: 11, fontWeight: '700', color: '#5B21B6' },
  details: {
    paddingHorizontal: 8, paddingVertical: 7, gap: 5,
    borderRadius: 8, borderColor: '#CBD5E1', borderWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  body: { color: '#334155', fontSize: 11, lineHeight: 15 },
  link: { color: '#5B21B6', fontSize: 11, fontWeight: '700' },
});
