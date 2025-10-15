import React from 'react';
import { View } from './types.ts';
import { HomeIcon, UploadIcon, ArchiveIcon, CompareIcon, AssistantIcon, SettingsIcon } from './components/common/Icons.tsx';

export const NAV_ITEMS = [
    { id: View.Dashboard, label: 'Dashboard', icon: <HomeIcon /> },
    { id: View.Upload, label: 'Carica Busta Paga', icon: <UploadIcon /> },
    { id: View.Archive, label: 'Archivio', icon: <ArchiveIcon /> },
    { id: View.Compare, label: 'Confronta', icon: <CompareIcon /> },
    { id: View.Assistant, label: 'Assistente AI', icon: <AssistantIcon /> },
    { id: View.Settings, label: 'Impostazioni', icon: <SettingsIcon /> },
];