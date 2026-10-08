/**
 * Verification contract for explicitly documented direct-journey examples.
 * This checks the provided catalog only, not the existence of services in a city.
 */
import { findDirectItineraries } from '../../src/routing/direct.ts';

const text = (value) => typeof value === 'string' && value.trim().length > 0;
const sameArray = (a, b) => Array.isArray(a) && Array.isArray(b) &&
  a.length === b.length && a.every((value, i) => value === b[i]);

export function verifyExpectedTrips(dataset, document) {
  const errors = [];
  if (document?.schemaVersion !== '0.1.0') errors.push('schemaVersion de casos debe ser 0.1.0');
  if (document?.datasetVersion !== dataset?.datasetVersion) {
    errors.push('datasetVersion de casos no corresponde al catálogo');
  }
  if (document?.scope !== 'provided-catalog') {
    errors.push('scope debe ser provided-catalog: ausencia solo dentro de la muestra');
  }
  if (!Array.isArray(document?.cases) || document.cases.length === 0) {
    errors.push('cases debe incluir al menos un viaje documentado');
    return { errors, checked: 0 };
  }

  const cityIds = new Set((dataset.cities ?? []).map((item) => item.id));
  const stopById = new Map((dataset.stops ?? []).map((item) => [item.id, item]));
  const routes = new Map((dataset.routes ?? []).map((item) => [item.id, item]));
  const patterns = new Map((dataset.patterns ?? []).map((item) => [item.id, item]));
  const sourceIds = new Set((dataset.sourceRefs ?? []).map((item) => item.id));
  const caseIds = new Set();

  for (const [i, item] of document.cases.entries()) {
    const prefix = `cases[${i}]${text(item?.id) ? ' (' + item.id + ')' : ''}`;
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      errors.push(`${prefix}: caso inválido`);
      continue;
    }
    if (!text(item.id) || caseIds.has(item.id)) errors.push(`${prefix}: id ausente o duplicado`);
    caseIds.add(item.id);

    const { cityId, originStopId, destinationStopId } = item;
    const origin = stopById.get(originStopId);
    const destination = stopById.get(destinationStopId);
    if (!cityIds.has(cityId) || !origin || !destination ||
        origin?.cityId !== cityId || destination?.cityId !== cityId) {
      errors.push(`${prefix}: ciudad, origen o destino fuera de cobertura del catálogo`);
      continue;
    }
    if (!Array.isArray(item.sourceRefIds) || item.sourceRefIds.length === 0 ||
        item.sourceRefIds.some((id) => !sourceIds.has(id))) {
      errors.push(`${prefix}: sourceRefIds ausentes o inválidos`);
      continue;
    }
    if (!item.expected || !['ok', 'no-direct-service', 'same-stop'].includes(item.expected.status)) {
      errors.push(`${prefix}: expected.status inválido`);
      continue;
    }
    const expected = item.expected;

    if (expected.status === 'ok') {
      if (!text(expected.routeId) || !text(expected.patternId) ||
          !text(expected.directionId) || !Array.isArray(expected.stopIds) ||
          expected.stopIds.length < 2 || expected.stopIds.some((id) => !text(id))) {
        errors.push(`${prefix}: faltan routeId, patternId, directionId o stopIds`);
        continue;
      }
      const pattern = patterns.get(expected.patternId);
      const route = routes.get(expected.routeId);
      if (!pattern || !route || pattern.routeId !== route.id ||
          pattern.cityId !== cityId || route.cityId !== cityId ||
          pattern.directionId !== expected.directionId) {
        errors.push(`${prefix}: patrón, ruta, sentido o ciudad inconsistentes`);
        continue;
      }
      // Ensure expected observations are not an invented route segment.
      const boarded = pattern.stops.findIndex((s) => s.stopId === originStopId && s.boardingAllowed);
      const alighted = pattern.stops.findIndex((s) => s.stopId === destinationStopId && s.alightingAllowed);
      const documented = boarded >= 0 && alighted > boarded
        ? pattern.stops.slice(boarded, alighted + 1).map((s) => s.stopId) : null;
      if (!sameArray(documented, expected.stopIds)) {
        errors.push(`${prefix}: stopIds no coincide con el patrón y los permisos documentados`);
        continue;
      }
    } else {
      // A negative result is evidence only about this subset of data, not the whole city.
      if (!text(item.coverageNote)) {
        errors.push(`${prefix}: los casos negativos requieren coverageNote (alcance de la evidencia)`);
        continue;
      }
      if (expected.status === 'same-stop' && originStopId !== destinationStopId) {
        errors.push(`${prefix}: same-stop requiere origen y destino iguales`);
        continue;
      }
      if (expected.status === 'no-direct-service' && originStopId === destinationStopId) {
        errors.push(`${prefix}: no-direct-service no corresponde a la misma parada`);
        continue;
      }
    }

    const actual = findDirectItineraries(dataset, { cityId, originStopId, destinationStopId });
    if (actual.status !== expected.status) {
      errors.push(`${prefix}: esperado ${expected.status}, obtenido ${actual.status}`);
      continue;
    }
    if (expected.status === 'ok' && !actual.itineraries.some((trip) =>
      trip.routeId === expected.routeId && trip.patternId === expected.patternId &&
      trip.directionId === expected.directionId && sameArray(trip.stopIds, expected.stopIds)
    )) {
      errors.push(`${prefix}: no se obtuvo la ruta/patrón/sentido/secuencia esperados`);
    }
  }

  return { errors, checked: document.cases.length };
}
