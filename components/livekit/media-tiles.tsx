import React, { useMemo } from 'react';
import { Track } from 'livekit-client';
import { AnimatePresence, motion } from 'framer-motion';
import {
  type TrackReference,
  useLocalParticipant,
  useTracks,
  useVoiceAssistant,
} from '@livekit/components-react';
import { cn } from '@/lib/utils';
import { AgentTile } from './agent-tile';
import { AvatarTile } from './avatar-tile';
import { VideoTile } from './video-tile';

const MotionVideoTile = motion(VideoTile);
const MotionAgentTile = motion(AgentTile);
const MotionAvatarTile = motion(AvatarTile);

const animationProps = {
  initial: {
    opacity: 0,
    x: -100,
  },
  animate: {
    opacity: 1,
    x: 0,
  },
  exit: {
    opacity: 0,
    x: -100,
  },
  transition: {
    duration: 0.3,
    ease: 'easeInOut' as const,
  },
};

const classNames = {
  // GRID
  // 2 Columns x 3 Rows
  grid: [
    'h-full w-full',
    'grid gap-x-2 place-content-center',
    'grid-cols-[1fr_1fr] grid-rows-[90px_1fr_90px]',
  ],
  // Agent
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 1 / Row 1
  // align: x-end y-center
  agentChatOpenWithSecondTile: ['col-start-1 row-start-1', 'self-center justify-self-end'],
  // Agent
  // chatOpen: true,
  // hasSecondTile: false
  // layout: Column 1 / Row 1 / Column-Span 2
  // align: x-center y-center
  agentChatOpenWithoutSecondTile: ['col-start-1 row-start-1', 'col-span-2', 'place-content-center'],
  // Agent
  // chatOpen: false
  // layout: Column 1 / Row 1 / Column-Span 2 / Row-Span 3
  // align: x-center y-center
  agentChatClosed: ['col-start-1 row-start-1', 'col-span-2 row-span-3', 'place-content-center'],
  // Second tile
  // chatOpen: true,
  // hasSecondTile: true
  // layout: Column 2 / Row 1
  // align: x-start y-center
  secondTileChatOpen: ['col-start-2 row-start-1', 'self-center justify-self-start'],
  // Second tile
  // chatOpen: false,
  // hasSecondTile: false
  // layout: Column 2 / Row 2
  // align: x-end y-end
  secondTileChatClosed: ['col-start-2 row-start-3', 'place-content-end'],
};

export function useLocalTrackRef(source: Track.Source) {
  const { localParticipant } = useLocalParticipant();
  const publication = localParticipant.getTrackPublication(source);
  const trackRef = useMemo(
    () => (publication ? { source, participant: localParticipant, publication } : undefined),
    [source, publication, localParticipant]
  );
  return trackRef;
}

interface MediaTilesProps {
  chatOpen: boolean;
}

export function MediaTiles({ chatOpen }: MediaTilesProps) {
  const {
    state: agentState,
    audioTrack: agentAudioTrack,
    videoTrack: agentVideoTrack,
  } = useVoiceAssistant();
  const [screenShareTrack] = useTracks([Track.Source.ScreenShare]);
  const cameraTrack = useLocalTrackRef(Track.Source.Camera);

  const isCameraEnabled = cameraTrack && !cameraTrack.publication.isMuted;
  const isScreenShareEnabled = screenShareTrack && !screenShareTrack.publication.isMuted;
  const hasSecondTile = isCameraEnabled || isScreenShareEnabled;

  const transition = {
    ...animationProps.transition,
    delay: chatOpen ? 0 : 0.15,
  };
  const agentAnimate = {
    ...animationProps.animate,
    transition,
  };
  const avatarAnimate = {
    ...animationProps.animate,
    transition,
  };
  const agentLayoutTransition = transition;
  const avatarLayoutTransition = transition;

  const isAvatar = agentVideoTrack !== undefined;

  return (
    <div className={cn(
      'pointer-events-none',
      // Mobile: Top center when chat open, fullscreen when closed
      // Desktop: Left center when chat open, fullscreen when closed
      chatOpen
        ? 'fixed top-28 left-1/2 -translate-x-1/2 z-50 xl:left-8 xl:top-1/2 xl:-translate-y-1/2 xl:translate-x-0'
        : 'fixed inset-x-0 top-8 bottom-32 z-50 md:top-12 md:bottom-40'
    )}>
      <div className={cn(
        'relative h-full w-full',
        chatOpen ? 'px-4 mx-0 max-w-none md:px-0' : 'px-4 mx-auto max-w-2xl md:px-0'
      )}>
        <div className={cn(
          // Mobile: single column layout with tighter spacing
          // Desktop: grid layout
          chatOpen 
            ? 'flex flex-col items-center gap-2 md:grid md:gap-x-2 md:place-content-center md:grid-cols-[1fr_1fr] md:grid-rows-[90px_1fr_90px]'
            : classNames.grid
        )}>
          {/* agent */}
          <div
            className={cn([
              chatOpen 
                ? 'flex justify-center w-full md:grid' 
                : 'grid',
              !chatOpen && classNames.agentChatClosed,
              chatOpen && hasSecondTile && 'md:col-start-1 md:row-start-1 md:self-center md:justify-self-end',
              chatOpen && !hasSecondTile && 'md:col-start-1 md:row-start-1 md:col-span-2 md:place-content-center',
            ])}
          >
            <AnimatePresence mode="wait">
              {!isAvatar && (
                // audio-only agent
                <MotionAgentTile
                  key="agent"
                  layoutId="agent-avatar"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0 }}
                  state={agentState}
                  audioTrack={agentAudioTrack}
                  className={cn(
                    'overflow-hidden flex items-center justify-center',
                    chatOpen
                      ? 'aspect-square h-[140px] w-[140px] rounded-full md:h-[180px] md:w-[180px]'
                      : 'h-auto w-full rounded-lg'
                  )}
                />
              )}
              {isAvatar && (
                // avatar agent
                <MotionAvatarTile
                  key="avatar"
                  layoutId="agent-avatar"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0 }}
                  videoTrack={agentVideoTrack}
                  chatOpen={chatOpen}
                  className={cn(
                    'overflow-hidden flex items-center justify-center',
                    chatOpen
                      ? 'aspect-square h-[140px] w-[140px] rounded-full [&>video]:object-cover md:h-[180px] md:w-[180px]'
                      : 'h-auto w-full rounded-lg [&>video]:object-cover'
                  )}
                  style={chatOpen ? {
                    border: '3px solid rgba(139, 92, 246, 0.3)',
                    boxShadow: '0 10px 30px rgba(139, 92, 246, 0.2)',
                  } : undefined}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Second tile container */}
          <div
            className={cn([
              chatOpen 
                ? 'flex justify-center w-full md:grid' 
                : 'grid',
              chatOpen && 'md:col-start-2 md:row-start-1 md:self-center md:justify-self-start',
              !chatOpen && classNames.secondTileChatClosed,
            ])}
          >
            {/* camera */}
            <AnimatePresence>
              {cameraTrack && isCameraEnabled && (
                <MotionVideoTile
                  key="camera"
                  layout="position"
                  layoutId="camera"
                  {...animationProps}
                  trackRef={cameraTrack}
                  transition={{
                    ...animationProps.transition,
                    delay: chatOpen ? 0 : 0.15,
                  }}
                  className={cn(
                    chatOpen 
                      ? 'h-[100px] w-[100px] rounded-lg md:h-[90px] md:w-auto' 
                      : 'h-[90px]'
                  )}
                />
              )}
              {/* screen */}
              {isScreenShareEnabled && (
                <MotionVideoTile
                  key="screen"
                  layout="position"
                  layoutId="screen"
                  {...animationProps}
                  trackRef={screenShareTrack}
                  transition={{
                    ...animationProps.transition,
                    delay: chatOpen ? 0 : 0.15,
                  }}
                  className={cn(
                    chatOpen 
                      ? 'h-[100px] w-full max-w-[200px] rounded-lg md:h-[90px] md:w-auto md:max-w-none' 
                      : 'h-[90px]'
                  )}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}