'use client';

import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Track } from 'livekit-client';
import { BarVisualizer, useRemoteParticipants, useVoiceAssistant } from '@livekit/components-react';
import { ChatTextIcon, PhoneDisconnectIcon } from '@phosphor-icons/react/dist/ssr';
import { ChatInput } from '@/components/livekit/chat/chat-input';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { AppConfig } from '@/lib/types';
import { cn } from '@/lib/utils';
import { DeviceSelect } from '../device-select';
import { TrackToggle } from '../track-toggle';
import { UseAgentControlBarProps, useAgentControlBar } from './hooks/use-agent-control-bar';

export interface AgentControlBarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    UseAgentControlBarProps {
  capabilities: Pick<AppConfig, 'supportsChatInput' | 'supportsVideoInput' | 'supportsScreenShare'>;
  onChatOpenChange?: (open: boolean) => void;
  onSendMessage?: (message: string) => Promise<void>;
  onDisconnect?: () => void;
  onDeviceError?: (error: { source: Track.Source; error: Error }) => void;
  reset?: boolean;
}

/**
 * A control bar specifically designed for voice assistant interfaces
 */
export function AgentControlBar({
  controls,
  saveUserChoices = true,
  capabilities,
  className,
  onSendMessage,
  onChatOpenChange,
  onDisconnect,
  reset,
  onDeviceError,
  ...props
}: AgentControlBarProps) {
  const { videoTrack: agentVideoTrack } = useVoiceAssistant();
  const participants = useRemoteParticipants();
  const [chatOpen, setChatOpen] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState('');
  const [isSendingMessage, setIsSendingMessage] = React.useState(false);
  const hiddenTextRef = useRef<HTMLSpanElement>(null);
  const [inputWidth, setInputWidth] = useState(0);
  const [initialUnmuteDone, setInitialUnmuteDone] = useState(false);

  useEffect(() => {
    if (reset) {
      setChatOpen(false);
    }
  }, [reset]);

  useEffect(() => {
    if (hiddenTextRef.current) {
      setInputWidth(hiddenTextRef.current.offsetWidth);
    }
  }, [chatMessage]);

  const [isDisconnecting, setIsDisconnecting] = React.useState(false);

  const {
    micTrackRef,
    visibleControls,
    microphoneToggle,
    handleAudioDeviceChange,
    handleDisconnect,
  } = useAgentControlBar({
    controls,
    saveUserChoices,
  });

  const isAgentAvailable = participants.some((p) => p.isAgent);
  const isAvatarVisible = !!agentVideoTrack;

  useEffect(() => {
    if (isAvatarVisible && !initialUnmuteDone) {
      microphoneToggle.toggle(true);
      setInitialUnmuteDone(true);
    }
  }, [isAvatarVisible, initialUnmuteDone, microphoneToggle]);

  const isInputDisabled = !chatOpen || !isAgentAvailable || isSendingMessage;

  const handleSendMessage = async (message: string) => {
    setIsSendingMessage(true);
    try {
      await onSendMessage?.(message);
      setChatMessage('');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const onLeave = async () => {
    setIsDisconnecting(true);
    await handleDisconnect();
    setIsDisconnecting(false);
    onDisconnect?.();
  };

  React.useEffect(() => {
    onChatOpenChange?.(chatOpen);
  }, [chatOpen, onChatOpenChange]);

  const onMicrophoneDeviceSelectError = useCallback(
    (error: Error) => {
      onDeviceError?.({ source: Track.Source.Microphone, error });
    },
    [onDeviceError]
  );

  return (
    <div
      aria-label="Voice assistant controls"
      style={{ width: chatOpen ? `max(350px, min(${inputWidth + 150}px, 500px))` : '300px' }}
      className={cn(
        'bg-background mx-auto flex flex-col rounded-[31px] border border-black/20 p-3 drop-shadow-md/3 transition-all duration-300 dark:border-white/10',
        className
      )}
      {...props}
    >
      <span ref={hiddenTextRef} className="invisible absolute whitespace-pre">
        {chatMessage}
      </span>
      {capabilities.supportsChatInput && (
        <div
          inert={!chatOpen}
          className={cn(
            'overflow-hidden transition-[height] duration-300 ease-out',
            chatOpen ? 'h-auto' : 'h-0'
          )}
        >
          <div className="flex h-auto w-full">
            <ChatInput
              value={chatMessage}
              onChange={setChatMessage}
              onSend={handleSendMessage}
              disabled={isInputDisabled}
              className="w-full"
            />
          </div>
          <hr className="border-bg2 my-3 border-black/20" />
        </div>
      )}

      <div className="flex justify-center">
        <div className="flex gap-1">
          {visibleControls.microphone && (
            <div className="flex items-center gap-0">
              <TrackToggle
                variant="primary"
                source={Track.Source.Microphone}
                pressed={microphoneToggle.enabled}
                disabled={microphoneToggle.pending || !isAvatarVisible}
                onPressedChange={microphoneToggle.toggle}
                className="peer/track group/track relative w-auto pr-3 pl-3 md:rounded-r-none md:border-r-0 md:pr-2"
              >
                <BarVisualizer
                  barCount={3}
                  trackRef={micTrackRef}
                  options={{ minHeight: 5 }}
                  className="flex h-full w-auto items-center justify-center gap-0.5"
                >
                  <span
                    className={cn([
                      'h-full w-0.5 origin-center rounded-2xl',
                      'group-data-[state=on]/track:bg-fg1 group-data-[state=off]/track:bg-destructive-foreground',
                      'data-lk-muted:bg-muted',
                    ])}
                  ></span>
                </BarVisualizer>
              </TrackToggle>
              <hr className="bg-separator1 peer-data-[state=off]/track:bg-separatorSerious relative z-10 -mr-px hidden h-4 w-px md:block" />
              <DeviceSelect
                size="sm"
                kind="audioinput"
                requestPermissions={false}
                onMediaDeviceError={onMicrophoneDeviceSelectError}
                onActiveDeviceChange={handleAudioDeviceChange}
                className={cn([
                  'pl-2',
                  'peer-data-[state=off]/track:text-destructive-foreground',
                  'hover:text-fg1 focus:text-fg1',
                  'hover:peer-data-[state=off]/track:text-destructive-foreground focus:peer-data-[state=off]/track:text-destructive-foreground',
                  'hidden rounded-l-none md:block',
                ])}
              />
            </div>
          )}

          {visibleControls.chat && (
            <Toggle
              variant="secondary"
              aria-label="Toggle chat"
              pressed={chatOpen}
              onPressedChange={setChatOpen}
              disabled={!isAgentAvailable}
              className="aspect-square h-full"
            >
              <ChatTextIcon weight="bold" />
            </Toggle>
          )}

          {visibleControls.leave && (
            <Button
              variant="destructive"
              onClick={onLeave}
              disabled={isDisconnecting}
              className="font-mono"
            >
              <PhoneDisconnectIcon weight="bold" />
              <span className="hidden md:inline">END CALL</span>
              <span className="inline md:hidden">END</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
