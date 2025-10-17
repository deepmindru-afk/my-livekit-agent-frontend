'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  type AgentState,
  type ReceivedChatMessage,
  useRoomContext,
  useVoiceAssistant,
} from '@livekit/components-react';
import { toastAlert } from '@/components/alert-toast';
import { AgentControlBar } from '@/components/livekit/agent-control-bar/agent-control-bar';
import { ChatEntry } from '@/components/livekit/chat/chat-entry';
import { ChatMessageView } from '@/components/livekit/chat/chat-message-view';
import { MediaTiles } from '@/components/livekit/media-tiles';
import useChatAndTranscription from '@/hooks/useChatAndTranscription';
import { ThemeToggle } from './theme-toggle';
import { useDebugMode } from '@/hooks/useDebug';
import type { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';

function isAgentAvailable(agentState: AgentState) {
  return agentState == 'listening' || agentState == 'thinking' || agentState == 'speaking';
}

interface SessionViewProps {
  appConfig: AppConfig;
  disabled: boolean;
  sessionStarted: boolean;
}

export const SessionView = ({
  appConfig,
  disabled,
  sessionStarted,
  ref,
}: React.ComponentProps<'div'> & SessionViewProps) => {
  const { state: agentState, videoTrack } = useVoiceAssistant();
  const [chatOpen, setChatOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { messages, send } = useChatAndTranscription();
  const room = useRoomContext();
  const chatRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  useDebugMode({
    enabled: process.env.NODE_ENV !== 'production',
  });

  useEffect(() => {
    if (sessionStarted) {
      setResetTrigger((prev) => prev + 1);
      setChatOpen(false);
    }
  }, [sessionStarted]);

  async function handleSendMessage(message: string) {
    await send(message);
  }

  async function handleSendChatMessage() {
    if (inputValue.trim()) {
      await send(inputValue);
      setInputValue('');
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    const track = videoTrack?.publication?.track;

    if (video && track?.mediaStream) {
      video.srcObject = track.mediaStream;
      video.play().catch((error) => console.error('Video play failed:', error));
    }
    return () => {
      if (video) {
        video.srcObject = null;
      }
    };
  }, [videoTrack]);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  useEffect(() => {
    if (sessionStarted) {
      const timeout = setTimeout(() => {
        if (!isAgentAvailable(agentState)) {
          const reason =
            agentState === 'connecting'
              ? 'Agent did not join the room. '
              : 'Agent connected but did not complete initializing. ';

          toastAlert({
            title: 'Session ended',
            description: (
              <p className="w-full">
                {reason}
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href="https://docs.livekit.io/agents/start/voice-ai/"
                  className="whitespace-nowrap underline"
                >
                  See quickstart guide
                </a>
                .
              </p>
            ),
          });
          room.disconnect();
        }
      }, 20_000);

      return () => clearTimeout(timeout);
    }
  }, [agentState, sessionStarted, room]);

  const { supportsChatInput, supportsVideoInput, supportsScreenShare } = appConfig;
  const capabilities = {
    supportsChatInput,
    supportsVideoInput,
    supportsScreenShare,
  };

  return (
    <section
      ref={ref}
      inert={disabled}
      className={cn(
        'opacity-0',
        'bg-gradient-to-br from-white via-purple-50/50 to-purple-100/50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-purple-800/20 dark:to-slate-900'
      )}
      style={{
        minHeight: '100svh',
        position: 'relative',
      }}
    >
      {/* Animated background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-purple-500/5 to-violet-500/5 rounded-full blur-3xl animate-float"
          style={{ top: '-10%', left: '-5%' }}
        />
        <div 
          className="absolute w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-r from-violet-500/5 to-indigo-500/5 rounded-full blur-3xl animate-float-reverse"
          style={{ bottom: '-10%', right: '-5%' }}
        />
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(30px, -30px); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0px, 0px); }
          50% { transform: translate(-30px, 30px); }
        }
      `}
      </style>

      {/* Header with Logo and Theme Toggle - No bottom border */}
      <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-4 xs:px-6 sm:px-8 md:px-10 lg:px-16 py-4 xs:py-5 sm:py-6 md:py-7 backdrop-blur-sm">
        <a 
          href="https://10xds.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center min-w-0 group transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          {/* Light Mode Logo - Black */}
          <svg 
            className="h-6 xs:h-8 sm:h-10 w-auto block dark:hidden animate-in fade-in slide-in-from-left-4 duration-700 group-hover:opacity-75 transition-all"
            viewBox="0 0 88 37" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m69.9 27.2c0-0.1 0.2-0.3 0.5-0.4q0.4-0.2 0.6-0.2 0.4 0 0.5 0.4 0.1 0.6 0.3 1.3 0.3 0.7 0.8 1.6 0.5 0.9 1.2 1.6 0.7 0.6 1.8 1.1 1.1 0.5 2.3 0.5 0.5 0 1.1-0.1 0.5-0.2 1-0.4 0.5-0.2 0.8-0.6 0.4-0.3 0.7-0.8 0.3-0.4 0.5-1.1 0.2-0.6 0.2-1.3 0-0.5-0.1-0.9-0.2-0.5-0.4-0.9-0.2-0.4-0.4-0.8-0.3-0.3-0.7-0.7-0.4-0.4-0.7-0.6-0.3-0.3-0.8-0.6-0.5-0.3-0.8-0.5-0.3-0.2-0.9-0.6-0.5-0.3-0.8-0.4-0.1-0.1-0.3-0.2-0.6-0.4-0.9-0.6-0.4-0.2-1-0.6-0.6-0.5-0.9-0.7-0.3-0.3-0.8-0.8-0.5-0.4-0.8-0.8-0.3-0.3-0.6-0.9-0.4-0.5-0.5-1-0.2-0.5-0.3-1.1-0.1-0.6-0.1-1.2 0-1.5 0.7-2.8 0.6-1.4 1.8-2.3 1.1-0.9 2.5-1.4 1.5-0.5 3-0.5c1.4 0 5.1 0 5.1 0 0.2 0 0.3 0 0.7 0 0.1 0 0.6 0 0.8 0 0 0 0 4.6 0 7.1 0 0.2-0.2 0.3-0.4 0.3q-1.1 0-1.2-0.3 0-0.7-0.3-1.4-0.3-0.7-0.7-1.5-0.5-0.7-1.1-1.3-0.5-0.6-1.3-1-0.8-0.4-1.7-0.3-1.8 0-2.8 1-1 1-1 2.8 0 0.4 0.1 0.8 0.1 0.4 0.2 0.7 0.1 0.4 0.4 0.7 0.3 0.4 0.5 0.7 0.2 0.3 0.7 0.6 0.4 0.4 0.6 0.6 0.3 0.2 0.8 0.6 0.5 0.3 0.7 0.5 0.3 0.1 0.8 0.5 0.6 0.4 0.8 0.5 0.3 0.2 0.8 0.5 0.5 0.3 0.8 0.5 0.2 0.2 0.7 0.5 0.5 0.3 0.8 0.6 0.2 0.2 0.7 0.6 0.4 0.3 0.6 0.6 0.3 0.4 0.6 0.8 0.3 0.4 0.5 0.8 0.2 0.4 0.3 0.9 0.2 0.5 0.3 1 0.1 0.5 0.1 1.1 0 1.6-0.7 2.9-0.7 1.4-1.9 2.4-1.1 0.9-2.6 1.4-1.5 0.6-3.1 0.6c-0.1 0-2.3 0-2.4 0-0.1 0-2.5 0-2.5 0-0.1 0-3.2 0-3.2 0 0-1 0-3.1 0-4.6 0-1.4 0-1.9 0-2.9z" fill="#000000"/>
            <path d="m-0.5 12.2q0-0.3 0-0.4 1.7-0.7 3.8-1.6 2.1-1 3.3-1.5 1.1-0.5 1.2-0.5 0.2 0 0.3 0.2 0.1 0.3 0.2 0.5-0.4 1.3-0.4 3.8v16.3q0 2.5 0.3 3.4 0.1 0.3 1.1 0.5 0.9 0.2 1.5 0.2 0.1 0.2 0.1 0.7 0 0.4-0.1 0.6-3.2-0.2-5-0.2-1.8 0-5 0.2-0.1-0.2-0.1-0.6 0-0.5 0.1-0.7 0.6 0 1.6-0.2 0.9-0.2 1-0.5 0.3-0.9 0.3-3.4v-15.1q0-1-0.2-1.4-0.2-0.4-0.7-0.4-0.3 0-1.3 0.3-1 0.3-1.5 0.5-0.2 0-0.3-0.2-0.1-0.1-0.2-0.2 0-0.2 0-0.3z" fill="#000000"/>
            <path fillRule="evenodd" d="m11.8 21.3q0-2.7 0.7-5.1 0.7-2.4 1.8-4.2 1.2-1.7 2.9-2.8 1.7-1.1 3.7-1.1 2.7 0 4.9 1.7 2.1 1.7 3.3 4.7 1.1 3 1.1 6.8 0 2.6-0.7 5-0.7 2.4-1.9 4.2-1.2 1.8-2.9 2.8-1.8 1.1-3.8 1.1-2.6 0-4.7-1.7-2.1-1.6-3.2-4.6-1.2-3-1.2-6.8zm4.4 0.1q0 3.2 0.6 5.8 0.6 2.6 1.6 4.1 1.1 1.4 2.4 1.4 1.2 0 2.1-0.9 0.9-1 1.4-2.6 0.6-1.7 0.9-3.8 0.2-2.1 0.2-4.6 0-3.2-0.5-5.7-0.5-2.5-1.6-3.9-1-1.4-2.3-1.4-1.5 0-2.6 1.6-1.1 1.5-1.7 4.2-0.5 2.6-0.5 5.8z" fill="#000000"/>
            <path d="m34.6 5.2q1.2-0.6 1.5-0.6 0.5 0 0.5 0.5 0 0.8-1.6 2.4l-0.8 0.9 2 3.2 1.2-0.8 0.3 0.5q-0.3 0.5-0.9 1.1-0.7 0.5-1.4 0.5-0.4 0-0.6-0.4l-2-3-0.3 0.5q-0.9 1.1-0.9 1.8 0 0.3 0.1 0.5l-0.4 0.2q-0.7 0.4-1.1 0.4-0.4 0-0.4-0.5 0-0.8 1.6-2.5l0.9-1-1.8-2.8-1.1 0.7-0.3-0.5q0.1-0.3 0.9-1 0.9-0.7 1.4-0.7 0.3 0 0.4 0.2l1.9 2.9q1.1-1.3 1.1-1.9 0-0.2-0.1-0.4z" fill="#000000"/>
            <path d="m25.2 35c4.2-0.2 10.3-1.1 14.9-3 6.4-2.6 12.2-5.8 17.8-13.3 5-6.7 5.2-17.2 5.2-17.2h2.9c0 0-0.1 6-2.6 11.5-2.5 5.8-7 11.3-13.4 15.4-5.4 3.3-10.7 4.8-12.9 5.4-6 1.4-11.9 1.2-11.9 1.2z" fill="#6e3c95"/>
            <path d="m54 21.9c-1.3 1.5-3.9 3.6-4.8 4.2-1.2 0.9-2.2 0.6-2.2-0.6 0-1.2 0-15.7 0-15.7l-2.8-0.4v-1.2c0 0 10.3 0 11.3 0 2.1 0 4.4 0.4 5.6 0.9 0.7 0.3 3.4 1.2 5 2.9 1.7 1.7 2.5 2.9 3.2 5.6 0.7 2.7 0.4 5.1 0.2 6.3-0.2 1.2-0.8 3.7-2.5 5.7-1.8 2-3.2 3.1-6.8 4.2-1.8 0.5-3.9 0.6-5.2 0.6-1.3 0-10.9 0-10.9 0v-1.3c0 0 1.7-0.3 1.9-0.3 1.4-0.6 0.7-1.2 1.7-1.9 1.2-0.8 6-3.9 6-3.9 0 0-1.5 1.8-2.1 2.7-0.8 1.3-0.7 2.4-0.1 2.9 0.3 0.3 0.7 0.3 3.4 0.3 1.9 0 4.8-0.5 7-2.8 1.3-1.3 1.9-3.1 2.1-3.8 0.2-0.7 0.7-2.9 0.5-6-0.2-3-0.7-3.8-1-4.7-0.4-1.2-2.1-3.3-3.2-4-1-0.7-2.6-1.8-5.9-1.8-1 0-2.9 0-2.9 0 0 1.9 0 2.1 0 2.6 0 6.7 0 9.4 0 9.8 0 0.4 0.4 0.6 0.8 0.5 0.5-0.2 1.7-0.8 1.7-0.8z" fill="#000000"/>
          </svg>

          {/* Dark Mode Logo - White */}
          <svg 
            className="h-6 xs:h-8 sm:h-10 w-auto hidden dark:block animate-in fade-in slide-in-from-left-4 duration-700 group-hover:opacity-90 transition-all"
            viewBox="0 0 88 37" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="m69.9 27.2c0-0.1 0.2-0.3 0.5-0.4q0.4-0.2 0.6-0.2 0.4 0 0.5 0.4 0.1 0.6 0.3 1.3 0.3 0.7 0.8 1.6 0.5 0.9 1.2 1.6 0.7 0.6 1.8 1.1 1.1 0.5 2.3 0.5 0.5 0 1.1-0.1 0.5-0.2 1-0.4 0.5-0.2 0.8-0.6 0.4-0.3 0.7-0.8 0.3-0.4 0.5-1.1 0.2-0.6 0.2-1.3 0-0.5-0.1-0.9-0.2-0.5-0.4-0.9-0.2-0.4-0.4-0.8-0.3-0.3-0.7-0.7-0.4-0.4-0.7-0.6-0.3-0.3-0.8-0.6-0.5-0.3-0.8-0.5-0.3-0.2-0.9-0.6-0.5-0.3-0.8-0.4-0.1-0.1-0.3-0.2-0.6-0.4-0.9-0.6-0.4-0.2-1-0.6-0.6-0.5-0.9-0.7-0.3-0.3-0.8-0.8-0.5-0.4-0.8-0.8-0.3-0.3-0.6-0.9-0.4-0.5-0.5-1-0.2-0.5-0.3-1.1-0.1-0.6-0.1-1.2 0-1.5 0.7-2.8 0.6-1.4 1.8-2.3 1.1-0.9 2.5-1.4 1.5-0.5 3-0.5c1.4 0 5.1 0 5.1 0 0.2 0 0.3 0 0.7 0 0.1 0 0.6 0 0.8 0 0 0 0 4.6 0 7.1 0 0.2-0.2 0.3-0.4 0.3q-1.1 0-1.2-0.3 0-0.7-0.3-1.4-0.3-0.7-0.7-1.5-0.5-0.7-1.1-1.3-0.5-0.6-1.3-1-0.8-0.4-1.7-0.3-1.8 0-2.8 1-1 1-1 2.8 0 0.4 0.1 0.8 0.1 0.4 0.2 0.7 0.1 0.4 0.4 0.7 0.3 0.4 0.5 0.7 0.2 0.3 0.7 0.6 0.4 0.4 0.6 0.6 0.3 0.2 0.8 0.6 0.5 0.3 0.7 0.5 0.3 0.1 0.8 0.5 0.6 0.4 0.8 0.5 0.3 0.2 0.8 0.5 0.5 0.3 0.8 0.5 0.2 0.2 0.7 0.5 0.5 0.3 0.8 0.6 0.2 0.2 0.7 0.6 0.4 0.3 0.6 0.6 0.3 0.4 0.6 0.8 0.3 0.4 0.5 0.8 0.2 0.4 0.3 0.9 0.2 0.5 0.3 1 0.1 0.5 0.1 1.1 0 1.6-0.7 2.9-0.7 1.4-1.9 2.4-1.1 0.9-2.6 1.4-1.5 0.6-3.1 0.6c-0.1 0-2.3 0-2.4 0-0.1 0-2.5 0-2.5 0-0.1 0-3.2 0-3.2 0 0-1 0-3.1 0-4.6 0-1.4 0-1.9 0-2.9z" fill="#ffffff"/>
            <path d="m-0.5 12.2q0-0.3 0-0.4 1.7-0.7 3.8-1.6 2.1-1 3.3-1.5 1.1-0.5 1.2-0.5 0.2 0 0.3 0.2 0.1 0.3 0.2 0.5-0.4 1.3-0.4 3.8v16.3q0 2.5 0.3 3.4 0.1 0.3 1.1 0.5 0.9 0.2 1.5 0.2 0.1 0.2 0.1 0.7 0 0.4-0.1 0.6-3.2-0.2-5-0.2-1.8 0-5 0.2-0.1-0.2-0.1-0.6 0-0.5 0.1-0.7 0.6 0 1.6-0.2 0.9-0.2 1-0.5 0.3-0.9 0.3-3.4v-15.1q0-1-0.2-1.4-0.2-0.4-0.7-0.4-0.3 0-1.3 0.3-1 0.3-1.5 0.5-0.2 0-0.3-0.2-0.1-0.1-0.2-0.2 0-0.2 0-0.3z" fill="#ffffff"/>
            <path fillRule="evenodd" d="m11.8 21.3q0-2.7 0.7-5.1 0.7-2.4 1.8-4.2 1.2-1.7 2.9-2.8 1.7-1.1 3.7-1.1 2.7 0 4.9 1.7 2.1 1.7 3.3 4.7 1.1 3 1.1 6.8 0 2.6-0.7 5-0.7 2.4-1.9 4.2-1.2 1.8-2.9 2.8-1.8 1.1-3.8 1.1-2.6 0-4.7-1.7-2.1-1.6-3.2-4.6-1.2-3-1.2-6.8zm4.4 0.1q0 3.2 0.6 5.8 0.6 2.6 1.6 4.1 1.1 1.4 2.4 1.4 1.2 0 2.1-0.9 0.9-1 1.4-2.6 0.6-1.7 0.9-3.8 0.2-2.1 0.2-4.6 0-3.2-0.5-5.7-0.5-2.5-1.6-3.9-1-1.4-2.3-1.4-1.5 0-2.6 1.6-1.1 1.5-1.7 4.2-0.5 2.6-0.5 5.8z" fill="#ffffff"/>
            <path d="m34.6 5.2q1.2-0.6 1.5-0.6 0.5 0 0.5 0.5 0 0.8-1.6 2.4l-0.8 0.9 2 3.2 1.2-0.8 0.3 0.5q-0.3 0.5-0.9 1.1-0.7 0.5-1.4 0.5-0.4 0-0.6-0.4l-2-3-0.3 0.5q-0.9 1.1-0.9 1.8 0 0.3 0.1 0.5l-0.4 0.2q-0.7 0.4-1.1 0.4-0.4 0-0.4-0.5 0-0.8 1.6-2.5l0.9-1-1.8-2.8-1.1 0.7-0.3-0.5q0.1-0.3 0.9-1 0.9-0.7 1.4-0.7 0.3 0 0.4 0.2l1.9 2.9q1.1-1.3 1.1-1.9 0-0.2-0.1-0.4z" fill="#ffffff"/>
            <path d="m25.2 35c4.2-0.2 10.3-1.1 14.9-3 6.4-2.6 12.2-5.8 17.8-13.3 5-6.7 5.2-17.2 5.2-17.2h2.9c0 0-0.1 6-2.6 11.5-2.5 5.8-7 11.3-13.4 15.4-5.4 3.3-10.7 4.8-12.9 5.4-6 1.4-11.9 1.2-11.9 1.2z" fill="#6e3c95"/>
            <path d="m54 21.9c-1.3 1.5-3.9 3.6-4.8 4.2-1.2 0.9-2.2 0.6-2.2-0.6 0-1.2 0-15.7 0-15.7l-2.8-0.4v-1.2c0 0 10.3 0 11.3 0 2.1 0 4.4 0.4 5.6 0.9 0.7 0.3 3.4 1.2 5 2.9 1.7 1.7 2.5 2.9 3.2 5.6 0.7 2.7 0.4 5.1 0.2 6.3-0.2 1.2-0.8 3.7-2.5 5.7-1.8 2-3.2 3.1-6.8 4.2-1.8 0.5-3.9 0.6-5.2 0.6-1.3 0-10.9 0-10.9 0v-1.3c0 0 1.7-0.3 1.9-0.3 1.4-0.6 0.7-1.2 1.7-1.9 1.2-0.8 6-3.9 6-3.9 0 0-1.5 1.8-2.1 2.7-0.8 1.3-0.7 2.4-0.1 2.9 0.3 0.3 0.7 0.3 3.4 0.3 1.9 0 4.8-0.5 7-2.8 1.3-1.3 1.9-3.1 2.1-3.8 0.2-0.7 0.7-2.9 0.5-6-0.2-3-0.7-3.8-1-4.7-0.4-1.2-2.1-3.3-3.2-4-1-0.7-2.6-1.8-5.9-1.8-1 0-2.9 0-2.9 0 0 1.9 0 2.1 0 2.6 0 6.7 0 9.4 0 9.8 0 0.4 0.4 0.6 0.8 0.5 0.5-0.2 1.7-0.8 1.7-0.8z" fill="#ffffff"/>
          </svg>
        </a>
        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col min-h-[100svh] pt-24 sm:pt-28 md:pt-32 lg:pt-36 pb-32 sm:pb-36 md:pb-40 lg:pb-48 px-4 sm:px-8">
        {/* Content Container */}
        <div className="flex-1 flex flex-row gap-6 max-w-7xl mx-auto items-center w-full">
          {/* Avatar on the Left - Centered with Chat */}
          <div className={cn(
            'lg:w-1/5 flex flex-col items-center justify-center transition-all duration-300',
            chatOpen ? 'lg:visible' : 'lg:w-full'
          )}>
            <MediaTiles chatOpen={chatOpen} />
          </div>

          {/* Chat Panel - Fixed position above agent bar */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed bottom-36 sm:bottom-40 md:bottom-44 lg:bottom-48 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] sm:w-[calc(100%-3rem)] md:w-4/5 lg:w-3/5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-40 flex flex-col"
                style={{
                  height: 'calc(100svh - 20rem)',
                  maxHeight: 'calc(100svh - 24rem)',
                }}
              >
                <div
                ref={chatRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.map((message: ReceivedChatMessage) => (
                  <div
                    key={message.id}
                    className={cn('flex flex-col', message.from?.isLocal ? 'items-end' : 'items-start')}
                  >
                    <div
                      className={cn(
                        'flex flex-col gap-1 w-full',
                        message.from?.isLocal ? 'items-end' : 'items-start',
                      )}
                    >
                    <span className={cn(
                      'text-xs font-medium px-2',
                      message.from?.isLocal 
                        ? 'text-purple-700 dark:text-purple-300' 
                        : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {message.from?.isLocal ? 'User' : 'Agent'}
                    </span>
                    <div
                      className={cn(
                        'max-w-[70%] px-4 py-2.5 rounded-lg text-sm',
                        message.from?.isLocal
                          ? 'bg-blue-500 dark:bg-blue-600 text-white'
                          : 'bg-green-100 dark:bg-green-900 text-green-900 dark:text-green-100',
                      )}
                    >
                      <ChatEntry entry={message} />
                    </div>
                    </div>
                    <span
                      className={cn('font-mono text-xs text-gray-500 dark:text-gray-400 mt-1', message.from?.isLocal ? 'mr-2' : 'ml-2')}
                    >
                      {new Date(message.timestamp).toLocaleTimeString(undefined, { timeStyle: 'short' })}
                    </span>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Start a conversation...</p>
                  </div>
                )}
              </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Top Scrim */}
      <div 
        className="fixed top-0 right-0 left-0 h-24 sm:h-28 md:h-32 lg:h-36 pointer-events-none z-10"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white via-purple-50/50 to-transparent dark:from-slate-900 dark:via-purple-800/20" />
        <div className="absolute bottom-0 left-0 h-8 sm:h-10 md:h-12 w-full translate-y-full bg-gradient-to-b from-purple-100/20 to-transparent dark:from-slate-900/20" />
      </div>

      {/* Bottom Agent Control Bar */}
      <div 
        className="fixed right-0 bottom-0 left-0 z-50 px-3 sm:px-4 md:px-6 lg:px-12 pt-2 sm:pt-3 pb-3 sm:pb-4 md:pb-6 lg:pb-12"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-white via-purple-50/50 to-transparent dark:from-slate-900 dark:via-purple-800/20" />
        <motion.div
          key="control-bar"
          initial={{ opacity: 0, translateY: '100%' }}
          animate={{
            opacity: sessionStarted ? 1 : 0,
            translateY: sessionStarted ? '0%' : '100%',
          }}
          transition={{ duration: 0.3, delay: sessionStarted ? 0.5 : 0, ease: 'easeOut' }}
        >
          <div className="relative z-10 mx-auto w-full max-w-2xl">
            {appConfig.isPreConnectBufferEnabled && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{
                  opacity: sessionStarted && messages.length === 0 ? 1 : 0,
                  transition: {
                    ease: 'easeIn',
                    delay: messages.length > 0 ? 0 : 0.8,
                    duration: messages.length > 0 ? 0.2 : 0.5,
                  },
                }}
                aria-hidden={messages.length > 0}
                className={cn(
                  'absolute inset-x-0 -top-8 sm:-top-10 md:-top-12 text-center',
                  sessionStarted && messages.length === 0 && 'pointer-events-none'
                )}
              >
              </motion.div>
            )}

            <AgentControlBar
              key={resetTrigger}
              capabilities={capabilities}
              onChatOpenChange={setChatOpen}
              onSendMessage={handleSendMessage}
            />
          </div>
          <div className="absolute top-0 left-0 h-8 sm:h-10 md:h-12 w-full -translate-y-full bg-gradient-to-t from-purple-100/20 to-transparent dark:from-slate-900/20" />
        </motion.div>
      </div>
    </section>
  );
};