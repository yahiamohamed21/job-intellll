// src/context/WizardContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import wizardService from '../api/wizardService';

const WizardContext = createContext(null);
export const useWizard = () => useContext(WizardContext);

export const WizardProvider = ({ children }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    try {
      const { data } = await wizardService.getStatus();
      setStatus(data.data);
    } catch (err) {
      console.error('Failed to fetch wizard status', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const advanceTo = useCallback(async (step) => {
    try {
      await wizardService.advanceStep(step); 
      await refreshStatus();
      return true;
    } catch (err) {
      console.error('Failed to advance wizard', err);
      return false;
    }
  }, [refreshStatus]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  return (
    <WizardContext.Provider
      value={{
        currentStep: status?.currentStep ?? 0,
        isComplete: status?.isComplete ?? false,
        loading,
        refreshStatus,
        advanceTo,
      }}
    >
      {children}
    </WizardContext.Provider>
  );
};
