import { useCallback, useState } from 'react';

const useCacheBuster = () => {
  const [cacheBuster, setCacheBuster] = useState<boolean>(false);

  const updateCacheBuster = useCallback(() => {
    setCacheBuster((current) => !current);
  }, []);

  return [cacheBuster, updateCacheBuster] as const;
};

export default useCacheBuster;
