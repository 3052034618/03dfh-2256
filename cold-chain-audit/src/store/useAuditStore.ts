import { create } from 'zustand';
import type { Waybill, CarrierScore, FilterParams, RiskPoint } from '../types';

interface AuditState {
  waybills: Waybill[];
  selectedWaybills: string[];
  currentWaybill: Waybill | null;
  carrierScores: CarrierScore[];
  filters: FilterParams;
  isReviewMode: boolean;
  reviewWaybillIndex: number;
  
  setWaybills: (waybills: Waybill[]) => void;
  setFilters: (filters: Partial<FilterParams>) => void;
  resetFilters: () => void;
  selectWaybill: (id: string, selected: boolean) => void;
  selectAllWaybills: (ids: string[]) => void;
  clearSelection: () => void;
  enterReviewMode: () => void;
  exitReviewMode: () => void;
  setCurrentWaybill: (waybill: Waybill | null) => void;
  nextWaybill: () => void;
  prevWaybill: () => void;
  updateRiskPoint: (waybillId: string, riskId: string, updates: Partial<RiskPoint>) => void;
  updateWaybillResult: (waybillId: string, result: 'qualified' | 'unqualified', opinion: string) => void;
  setCarrierScores: (scores: CarrierScore[]) => void;
  getFilteredWaybills: () => Waybill[];
  getSelectedWaybillObjects: () => Waybill[];
}

const defaultFilters: FilterParams = {
  customerIds: [],
  routeIds: [],
  carrierIds: [],
  temperatureZones: [],
  dateRange: null,
};

export const useAuditStore = create<AuditState>((set, get) => ({
  waybills: [],
  selectedWaybills: [],
  currentWaybill: null,
  carrierScores: [],
  filters: defaultFilters,
  isReviewMode: false,
  reviewWaybillIndex: 0,

  setWaybills: (waybills) => set({ waybills }),

  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),

  resetFilters: () => set({ filters: defaultFilters }),

  selectWaybill: (id, selected) => set((state) => ({
    selectedWaybills: selected
      ? [...state.selectedWaybills, id]
      : state.selectedWaybills.filter(wid => wid !== id)
  })),

  selectAllWaybills: (ids) => set({ selectedWaybills: ids }),

  clearSelection: () => set({ selectedWaybills: [] }),

  enterReviewMode: () => set({ isReviewMode: true, reviewWaybillIndex: 0 }),

  exitReviewMode: () => set({ isReviewMode: false, reviewWaybillIndex: 0, currentWaybill: null }),

  setCurrentWaybill: (waybill) => set({ currentWaybill: waybill }),

  nextWaybill: () => set((state) => {
    const selected = get().getSelectedWaybillObjects();
    const nextIndex = Math.min(state.reviewWaybillIndex + 1, selected.length - 1);
    return {
      reviewWaybillIndex: nextIndex,
      currentWaybill: selected[nextIndex]
    };
  }),

  prevWaybill: () => set((state) => {
    const selected = get().getSelectedWaybillObjects();
    const prevIndex = Math.max(state.reviewWaybillIndex - 1, 0);
    return {
      reviewWaybillIndex: prevIndex,
      currentWaybill: selected[prevIndex]
    };
  }),

  updateRiskPoint: (waybillId, riskId, updates) => set((state) => ({
    waybills: state.waybills.map(w => {
      if (w.id !== waybillId) return w;
      return {
        ...w,
        riskPoints: w.riskPoints.map(r =>
          r.id === riskId ? { ...r, ...updates } : r
        )
      };
    }),
    currentWaybill: state.currentWaybill?.id === waybillId
      ? {
          ...state.currentWaybill,
          riskPoints: state.currentWaybill.riskPoints.map(r =>
            r.id === riskId ? { ...r, ...updates } : r
          )
        }
      : state.currentWaybill
  })),

  updateWaybillResult: (waybillId, result, opinion) => set((state) => ({
    waybills: state.waybills.map(w =>
      w.id === waybillId
        ? {
            ...w,
            finalResult: result,
            auditOpinion: opinion,
            reviewStatus: 'completed',
            auditTime: Date.now(),
            auditor: '质控员'
          }
        : w
    ),
    currentWaybill: state.currentWaybill?.id === waybillId
      ? {
          ...state.currentWaybill,
          finalResult: result,
          auditOpinion: opinion,
          reviewStatus: 'completed',
          auditTime: Date.now(),
          auditor: '质控员'
        }
      : state.currentWaybill
  })),

  setCarrierScores: (scores) => set({ carrierScores: scores }),

  getFilteredWaybills: () => {
    const { waybills, filters } = get();
    return waybills.filter(w => {
      if (filters.customerIds.length > 0 && !filters.customerIds.includes(w.customerId)) return false;
      if (filters.routeIds.length > 0 && !filters.routeIds.includes(w.routeId)) return false;
      if (filters.carrierIds.length > 0 && !filters.carrierIds.includes(w.carrierId)) return false;
      if (filters.temperatureZones.length > 0 && !filters.temperatureZones.includes(w.temperatureZone)) return false;
      if (filters.dateRange) {
        const [start, end] = filters.dateRange;
        if (w.shipmentDate < start || w.shipmentDate > end) return false;
      }
      if (filters.reviewStatus && w.reviewStatus !== filters.reviewStatus) return false;
      return true;
    });
  },

  getSelectedWaybillObjects: () => {
    const { waybills, selectedWaybills } = get();
    return selectedWaybills
      .map(id => waybills.find(w => w.id === id))
      .filter((w): w is Waybill => w !== undefined);
  }
}));
