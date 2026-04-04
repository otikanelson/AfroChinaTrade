import { useState, useCallback } from 'react';
import { pageLayoutService, LayoutBlock } from '../services/PageLayoutService';

export const useLayoutChangeDetection = (page: 'home' | 'buy-now') => {
  const [layoutVersion, setLayoutVersion] = useState<string>('');
  const [pageLayout, setPageLayout] = useState<LayoutBlock[]>([]);

  const checkForLayoutChanges = useCallback(async (): Promise<{ hasChanged: boolean; layout?: LayoutBlock[] }> => {
    try {
      const response = await pageLayoutService.getLayout(page);
      if (response.success && response.data) {
        const newLayoutVersion = response.data.updatedAt;
        const hasChanged = layoutVersion && newLayoutVersion !== layoutVersion;
        
        if (hasChanged || !layoutVersion) {
          setLayoutVersion(newLayoutVersion);
          setPageLayout(response.data.blocks);
          return { hasChanged, layout: response.data.blocks };
        }
        
        return { hasChanged: false };
      }
    } catch (error) {
      console.error('Failed to check layout changes:', error);
    }
    
    return { hasChanged: false };
  }, [page, layoutVersion]);

  const resetLayoutVersion = useCallback(() => {
    setLayoutVersion('');
    setPageLayout([]);
  }, []);

  return {
    layoutVersion,
    pageLayout,
    checkForLayoutChanges,
    resetLayoutVersion
  };
};