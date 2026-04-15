import * as React from 'react';
import { useMatches } from 'react-router-dom';

export const usePageTitle = (): string => {
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  return (lastMatch?.handle as { title?: string })?.title || 'Dashboard';
};

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const query = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(event.matches);
    };

    updateIsMobile(query);
    query.addEventListener('change', updateIsMobile);

    return () => query.removeEventListener('change', updateIsMobile);
  }, []);

  return isMobile;
};
