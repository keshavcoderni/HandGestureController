import React from 'react';
import { CursorSettings, CursorStyle } from '../types';

interface CursorPreviewProps {
  settings: CursorSettings;
}

export const CursorPreview: React.FC<CursorPreviewProps> = ({ settings }) => {
  // Scaled for preview matching settings.size.dp / 2 in Jetpack Compose
  const previewSize = Math.max(16, settings.size / 2);
  const color = settings.color;
  const opacity = settings.transparency;

  switch (settings.style) {
    case CursorStyle.CIRCLE:
      return (
        <div
          id="cursor-preview-circle"
          style={{
            width: `${previewSize}px`,
            height: `${previewSize}px`,
            backgroundColor: color,
            opacity: opacity,
          }}
          className="rounded-full border-2 border-white shadow-md transition-all duration-150"
        />
      );

    case CursorStyle.SQUARE:
      return (
        <div
          id="cursor-preview-square"
          style={{
            width: `${previewSize}px`,
            height: `${previewSize}px`,
            backgroundColor: color,
            opacity: opacity,
          }}
          className="rounded-[4px] border-2 border-white shadow-md transition-all duration-150"
        />
      );

    case CursorStyle.RING:
      return (
        <div
          id="cursor-preview-ring"
          style={{
            width: `${previewSize}px`,
            height: `${previewSize}px`,
            borderColor: color,
            opacity: opacity,
          }}
          className="rounded-full border-[4px] bg-transparent shadow-sm transition-all duration-150"
        />
      );

    case CursorStyle.DOT:
      return (
        <div
          id="cursor-preview-dot"
          style={{
            width: `${Math.max(8, previewSize / 2)}px`,
            height: `${Math.max(8, previewSize / 2)}px`,
            backgroundColor: color,
            opacity: opacity,
          }}
          className="rounded-full border border-white shadow-sm transition-all duration-150"
        />
      );

    default:
      return null;
  }
};
