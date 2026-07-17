
'use client';

import { useUser } from '@/firebase';
import { useState, useEffect, useRef } from 'react';
import LevelUpAnimation from './level-up-animation';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';

export default function GamificationListener() {
  const { user, isUserLoading, firestore } = useUser();
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState<{ level: number; title: string } | null>(null);
  
  // Use a ref to track the previous level without causing re-renders
  const previousLevelRef = useRef<number | null>(null);

  useEffect(() => {
    // This listener is now effectively disabled as requested by the user
    // to prevent the buggy level-up animation from showing.
    // The core logic for updating points and streaks still runs in the provider.
  }, [user, isUserLoading]);


  const handleCloseAnimation = () => {
    setShowLevelUp(false);
    setLevelUpInfo(null);
  };

  // By returning null, we prevent the buggy LevelUpAnimation from ever rendering.
  return null;
}
