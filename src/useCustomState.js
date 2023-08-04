import { useState, useEffect } from 'react';

const useCustomState = () => {
    const [leanCode, setLeanCode] = useState(() => {
        // Check if there's a saved value in local storage, otherwise return the initial value
        return localStorage.getItem('leanCode') || `default`;
      });

  useEffect(() => {
    localStorage.setItem('leanCode', leanCode);
  }, [leanCode]);

  return {leanCode};
}
 
export default useCustomState;