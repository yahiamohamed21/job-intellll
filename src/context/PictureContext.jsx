/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext.jsx';
import wizardService from '../api/wizardService.js';

const PictureContext = createContext(null);

/**
 * Centralized profile picture state for the current user.
 *
 * Provides:
 *  - pictureUrl: stable URL with cache-busting version param
 *  - pictureMeta: { hasProfilePicture, isOAuthPicture, isDefaultPicture }
 *  - uploading: boolean
 *  - uploadPicture(file): upload + refresh
 *  - deletePicture(): delete + refresh
 *  - refreshPicture(): force re-fetch from API
 */
export const PictureProvider = ({ children }) => {
  const { user } = useAuth();
  const isJobSeeker = (user?.accountType || '').toString() === 'JobSeeker' || user?.accountType === 0;
  const isRecruiter = (user?.accountType || '').toString() === 'Recruiter' || user?.accountType === 1;

  const [pictureMeta, setPictureMeta] = useState(null);
  const [uploading, setUploading] = useState(false);
  const versionRef = useRef(0);
  // Force re-render when version changes
  const [, setTick] = useState(0);

  const fetchPictureInfo = useCallback(async () => {
    if (!isJobSeeker) return;
    try {
      const res = await wizardService.getPictureInfo();
      const data = res.data?.data || res.data || null;
      if (data && data.hasProfilePicture) {
        setPictureMeta(data);
      } else {
        setPictureMeta(null);
      }
    } catch {
      setPictureMeta(null);
    }
  }, [isJobSeeker]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user) {
      fetchPictureInfo();
    } else {
      setPictureMeta(null);
    }
  }, [user, fetchPictureInfo]);

  // Build the display URL with cache-busting version
  const pictureUrl = pictureMeta?.url
    ? `${pictureMeta.url}?v=${versionRef.current}`
    : null;

  const uploadPicture = useCallback(async (file) => {
    if (!isJobSeeker) return;
    setUploading(true);
    try {
      await wizardService.uploadPicture(file);
      versionRef.current += 1;
      setTick(t => t + 1);
      await fetchPictureInfo();
    } finally {
      setUploading(false);
    }
  }, [fetchPictureInfo, isJobSeeker]);

  const deletePicture = useCallback(async () => {
    if (!isJobSeeker) return;
    await wizardService.deletePicture();
    versionRef.current += 1;
    setTick(t => t + 1);
    setPictureMeta(null);
  }, [isJobSeeker]);

  const refreshPicture = useCallback(async () => {
    versionRef.current += 1;
    setTick(t => t + 1);
    await fetchPictureInfo();
  }, [fetchPictureInfo]);

  return (
    <PictureContext.Provider value={{
      pictureUrl,
      pictureMeta,
      uploading,
      uploadPicture,
      deletePicture,
      refreshPicture,
      isJobSeeker,
      isRecruiter,
    }}>
      {children}
    </PictureContext.Provider>
  );
};

export const usePicture = () => useContext(PictureContext);
