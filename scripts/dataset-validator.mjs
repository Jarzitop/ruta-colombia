function assert(condition, message, errors) {
  if (!condition) errors.push(message);
}

function hasFiniteCoordinate(value, min, max) {
  return Number.isFinite(value) && value >= min && value <= max;
}

function validateSourceRefs(owner, refs, sourceIds, errors) {
  assert(Array.isArray(refs) && refs.length > 0, `${owner}: sourceRefIds debe ser no vacío`, errors);
  for (const ref of refs ?? []) {
    assert(sourceIds.has(ref), `${owner}: fuente inexistente ${ref}`, errors);
  }
}

export function validateDataset(dataset) {
  const errors = [];
  assert(dataset?.schemaVersion === '0.1.0', 'schemaVersion debe ser 0.1.0', errors);
  assert(typeof dataset?.datasetVersion === 'string' && dataset.datasetVersion.length > 0, 'datasetVersion requerido', errors);
  assert(typeof dataset?.publishable === 'boolean', 'publishable debe ser boolean', errors);

  const collections = ['sourceRefs', 'cities', 'stops', 'routes', 'patterns', 'walkingConnections'];
  for (const key of collections) assert(Array.isArray(dataset?.[key]), `${key} debe ser un arreglo`, errors);
  if (errors.length) return errors;

  const duplicateCheck = (items, label) => {
    const seen = new Set();
    for (const item of items) {
      assert(typeof item?.id === 'string' && item.id.length > 0, `${label}: id requerido`, errors);
      assert(!seen.has(item.id), `${label}: id duplicado ${item.id}`, errors);
      seen.add(item.id);
    }
    return seen;
  };

  const sourceIds = duplicateCheck(dataset.sourceRefs, 'sourceRefs');
  const cityIds = duplicateCheck(dataset.cities, 'cities');
  duplicateCheck(dataset.stops, 'stops');
  duplicateCheck(dataset.routes, 'routes');
  duplicateCheck(dataset.patterns, 'patterns');
  duplicateCheck(dataset.walkingConnections, 'walkingConnections');

  for (const source of dataset.sourceRefs) {
    assert(['official', 'secondary', 'synthetic'].includes(source.kind), `source ${source.id}: kind inválido`, errors);
    assert(typeof source.publisher === 'string' && source.publisher.length > 0, `source ${source.id}: publisher requerido`, errors);
    assert(/^\d{4}-\d{2}-\d{2}$/.test(source.consultedAt ?? ''), `source ${source.id}: consultedAt debe ser YYYY-MM-DD`, errors);
  }

  for (const city of dataset.cities) validateSourceRefs(`city ${city.id}`, city.sourceRefIds, sourceIds, errors);

  const stopById = new Map(dataset.stops.map((stop) => [stop.id, stop]));
  for (const stop of dataset.stops) {
    assert(cityIds.has(stop.cityId), `stop ${stop.id}: cityId inexistente ${stop.cityId}`, errors);
    assert(hasFiniteCoordinate(stop.latitude, -90, 90), `stop ${stop.id}: latitude inválida`, errors);
    assert(hasFiniteCoordinate(stop.longitude, -180, 180), `stop ${stop.id}: longitude inválida`, errors);
    validateSourceRefs(`stop ${stop.id}`, stop.sourceRefIds, sourceIds, errors);
  }

  const routeById = new Map(dataset.routes.map((route) => [route.id, route]));
  for (const route of dataset.routes) {
    assert(cityIds.has(route.cityId), `route ${route.id}: cityId inexistente ${route.cityId}`, errors);
    validateSourceRefs(`route ${route.id}`, route.sourceRefIds, sourceIds, errors);
  }

  for (const pattern of dataset.patterns) {
    const route = routeById.get(pattern.routeId);
    assert(Boolean(route), `pattern ${pattern.id}: routeId inexistente ${pattern.routeId}`, errors);
    assert(cityIds.has(pattern.cityId), `pattern ${pattern.id}: cityId inexistente ${pattern.cityId}`, errors);
    if (route) assert(route.cityId === pattern.cityId, `pattern ${pattern.id}: ciudad distinta a route`, errors);
    assert(typeof pattern.directionId === 'string' && pattern.directionId.length > 0, `pattern ${pattern.id}: directionId requerido`, errors);
    assert(Array.isArray(pattern.stops) && pattern.stops.length >= 2, `pattern ${pattern.id}: requiere al menos 2 paradas`, errors);

    let previousSequence = -Infinity;
    const seenPatternStops = new Set();
    for (const entry of pattern.stops ?? []) {
      const stop = stopById.get(entry.stopId);
      assert(Boolean(stop), `pattern ${pattern.id}: parada inexistente ${entry.stopId}`, errors);
      if (stop) assert(stop.cityId === pattern.cityId, `pattern ${pattern.id}: parada ${entry.stopId} pertenece a otra ciudad`, errors);
      assert(Number.isInteger(entry.sequence) && entry.sequence > previousSequence, `pattern ${pattern.id}: secuencia no estrictamente creciente`, errors);
      assert(!seenPatternStops.has(entry.stopId), `pattern ${pattern.id}: parada repetida ${entry.stopId}; documentar explícitamente bucles antes de admitirlos`, errors);
      assert(typeof entry.boardingAllowed === 'boolean', `pattern ${pattern.id}/${entry.stopId}: boardingAllowed requerido`, errors);
      assert(typeof entry.alightingAllowed === 'boolean', `pattern ${pattern.id}/${entry.stopId}: alightingAllowed requerido`, errors);
      previousSequence = entry.sequence;
      seenPatternStops.add(entry.stopId);
    }

    if (pattern.geometry) {
      assert(pattern.geometry.type === 'LineString', `pattern ${pattern.id}: geometry debe ser LineString`, errors);
      assert(Array.isArray(pattern.geometry.coordinates) && pattern.geometry.coordinates.length >= 2, `pattern ${pattern.id}: geometry requiere >=2 coordenadas`, errors);
      for (const [index, coordinate] of (pattern.geometry.coordinates ?? []).entries()) {
        assert(Array.isArray(coordinate) && coordinate.length === 2, `pattern ${pattern.id}: coordenada ${index} inválida`, errors);
        if (Array.isArray(coordinate) && coordinate.length === 2) {
          assert(hasFiniteCoordinate(coordinate[0], -180, 180), `pattern ${pattern.id}: longitud inválida en geometry[${index}]`, errors);
          assert(hasFiniteCoordinate(coordinate[1], -90, 90), `pattern ${pattern.id}: latitud inválida en geometry[${index}]`, errors);
        }
      }
    }
    validateSourceRefs(`pattern ${pattern.id}`, pattern.sourceRefIds, sourceIds, errors);
  }

  for (const connection of dataset.walkingConnections) {
    const from = stopById.get(connection.fromStopId);
    const to = stopById.get(connection.toStopId);
    assert(Boolean(from), `walkingConnection ${connection.id}: fromStopId inexistente`, errors);
    assert(Boolean(to), `walkingConnection ${connection.id}: toStopId inexistente`, errors);
    assert(connection.fromStopId !== connection.toStopId, `walkingConnection ${connection.id}: extremos idénticos`, errors);
    assert(cityIds.has(connection.cityId), `walkingConnection ${connection.id}: cityId inexistente`, errors);
    if (from) assert(from.cityId === connection.cityId, `walkingConnection ${connection.id}: fromStop pertenece a otra ciudad`, errors);
    if (to) assert(to.cityId === connection.cityId, `walkingConnection ${connection.id}: toStop pertenece a otra ciudad`, errors);
    assert(Number.isFinite(connection.distanceMeters) && connection.distanceMeters > 0, `walkingConnection ${connection.id}: distanceMeters debe ser > 0`, errors);
    assert(typeof connection.bidirectional === 'boolean', `walkingConnection ${connection.id}: bidirectional requerido`, errors);
    validateSourceRefs(`walkingConnection ${connection.id}`, connection.sourceRefIds, sourceIds, errors);
  }

  if (dataset.publishable) {
    const synthetic = dataset.sourceRefs.filter((source) => source.kind === 'synthetic');
    assert(synthetic.length === 0, 'dataset publicable no puede contener fuentes synthetic', errors);
  }

  return errors;
}

