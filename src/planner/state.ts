import type { TransitDataset } from '../data/contract';
import type { DirectSearchResult } from '../routing/direct';

export interface PlannerState {
  cityId: string | null;
  originStopId: string | null;
  destinationStopId: string | null;
  result: DirectSearchResult | null;
}

export const initialPlannerState: PlannerState = {
  cityId: null,
  originStopId: null,
  destinationStopId: null,
  result: null,
};

export type PlannerAction =
  | { type: 'city'; id: string }
  | { type: 'origin'; id: string }
  | { type: 'destination'; id: string }
  | { type: 'swap' }
  | { type: 'clear-result' }
  | { type: 'result'; value: DirectSearchResult };

type Catalog = Pick<TransitDataset, 'cities' | 'stops'>;

export function reducePlanner(
  state: PlannerState,
  action: PlannerAction,
  catalog: Catalog,
): PlannerState {
  if (action.type === 'city') {
    if (!catalog.cities.some((city) => city.id === action.id)) return state;
    if (state.cityId === action.id) return state;
    return { cityId: action.id, originStopId: null, destinationStopId: null, result: null };
  }

  if (action.type === 'origin' || action.type === 'destination') {
    if (!state.cityId || !catalog.stops.some((stop) =>
      stop.cityId === state.cityId && stop.id === action.id
    )) return state;
    const key = action.type === 'origin' ? 'originStopId' : 'destinationStopId';
    if (state[key] === action.id) return state;
    return { ...state, [key]: action.id, result: null };
  }

  if (action.type === 'swap') {
    if (!state.originStopId || !state.destinationStopId) return state;
    return {
      ...state,
      originStopId: state.destinationStopId,
      destinationStopId: state.originStopId,
      result: null,
    };
  }

  if (action.type === 'clear-result') return state.result === null ? state : { ...state, result: null };
  if (!state.cityId || !state.originStopId || !state.destinationStopId) return state;
  return { ...state, result: action.value };
}
