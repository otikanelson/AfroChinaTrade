import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tourGuideService, Tour, TourStep } from '../services/TourGuideService';

interface TourGuideContextType {
  activeTour: Tour | null;
  currentStep: number;
  isActive: boolean;
  startTour: (tourId: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipTour: () => void;
  completeTour: () => void;
  pauseTour: () => void;
  resumeTour: () => void;
  isTourCompleted: (tourId: string) => boolean;
  getTourProgress: (tourId: string) => number;
}

const TourGuideContext = createContext<TourGuideContextType | undefined>(undefined);

export function TourGuideProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    tourGuideService.initialize();
  }, []);

  const startTour = useCallback((tourId: string) => {
    const tour = tourGuideService.getTourById(tourId);
    if (tour) {
      setActiveTour(tour);
      setCurrentStep(0);
      setIsActive(true);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    
    const nextStepIndex = currentStep + 1;
    if (nextStepIndex < activeTour.steps.length) {
      setCurrentStep(nextStepIndex);
      tourGuideService.updateTourProgress(activeTour.id, nextStepIndex);
    } else {
      completeTour();
    }
  }, [activeTour, currentStep]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const skipTour = useCallback(() => {
    setActiveTour(null);
    setCurrentStep(0);
    setIsActive(false);
  }, []);

  const completeTour = useCallback(() => {
    if (activeTour) {
      tourGuideService.markTourCompleted(activeTour.id);
    }
    setActiveTour(null);
    setCurrentStep(0);
    setIsActive(false);
  }, [activeTour]);

  const pauseTour = useCallback(() => {
    setIsActive(false);
  }, []);

  const resumeTour = useCallback(() => {
    if (activeTour) {
      setIsActive(true);
    }
  }, [activeTour]);

  const isTourCompleted = useCallback((tourId: string) => {
    return tourGuideService.isTourCompleted(tourId);
  }, []);

  const getTourProgress = useCallback((tourId: string) => {
    return tourGuideService.getTourProgress(tourId);
  }, []);

  return (
    <TourGuideContext.Provider
      value={{
        activeTour,
        currentStep,
        isActive,
        startTour,
        nextStep,
        previousStep,
        skipTour,
        completeTour,
        pauseTour,
        resumeTour,
        isTourCompleted,
        getTourProgress,
      }}
    >
      {children}
    </TourGuideContext.Provider>
  );
}

export function useTourGuide() {
  const context = useContext(TourGuideContext);
  if (!context) {
    throw new Error('useTourGuide must be used within TourGuideProvider');
  }
  return context;
}
