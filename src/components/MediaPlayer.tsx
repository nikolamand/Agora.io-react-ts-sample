import { ILocalVideoTrack, IRemoteVideoTrack, ILocalAudioTrack, IRemoteAudioTrack, UID } from "agora-rtc-sdk-ng";
import React, { useRef, useEffect, useState } from "react";
import { volume } from "../hooks/useAgora";

export interface VideoPlayerProps {
  videoTrack: ILocalVideoTrack | IRemoteVideoTrack | undefined;
  audioTrack: ILocalAudioTrack | IRemoteAudioTrack | undefined;
  uid: UID | undefined;
  volumeIndicator: Array<volume> | undefined
}
const MediaPlayer = (props: VideoPlayerProps) => {
  const [activeSpeaker, setActiveSpeaker] = useState<volume | undefined>(undefined)
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    props.videoTrack?.play(container.current);
    return () => {
      props.videoTrack?.stop();
    };
  }, [container, props.videoTrack]);
  useEffect(() => {
    props.audioTrack?.play();
    return () => {
      props.audioTrack?.stop();
    };
  }, [props.audioTrack]);
  useEffect(() => {
    //clear active speaker indicator
    if(props.volumeIndicator === undefined) container.current?.classList.remove('active-speaker');
    props.volumeIndicator?.forEach(volume => {
      if(!activeSpeaker || (volume.level >= 3 && activeSpeaker.level < volume.level)){
        console.debug(`New active speaker, UID: ${volume.uid}, Level: ${volume.level}`);
        setActiveSpeaker(volume);
      }
      if(container.current?.id === `user-${activeSpeaker?.uid}`)
        container.current?.classList.add('active-speaker');
      else
        container.current?.classList.remove('active-speaker');
    });
  }, [props.volumeIndicator, activeSpeaker]);
  return (
    <div ref={container} id={`user-${props.uid}`} className="video-player" style={{ width: "320px", height: "240px"}}></div>
  );
}

export default MediaPlayer;