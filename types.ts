import React from 'react';

export enum AppId {
  SETTINGS = 'settings',
  CAMERA = 'camera',
  PHOTOS = 'photos',
  MUSIC = 'music',
  MESSAGES = 'messages',
  SIRI = 'siri' // Siri is a special overlay
}

export interface AppConfig {
  id: AppId;
  name: string;
  icon: React.ReactNode;
  color: string;
}

export interface Photo {
  id: string;
  url: string;
  timestamp: number;
}

export interface Message {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: Date;
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  messages: Message[];
}