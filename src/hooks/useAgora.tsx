import { useState, useEffect } from 'react';
import AgoraRTC, {
  IAgoraRTCClient, IAgoraRTCRemoteUser, MicrophoneAudioTrackInitConfig, CameraVideoTrackInitConfig, IMicrophoneAudioTrack, ICameraVideoTrack, ILocalVideoTrack, ILocalAudioTrack, ILocalTrack } from 'agora-rtc-sdk-ng';

export interface volume {
    uid: number,
    level: number    
}
export default function useAgora()
  :
   {
      localAudioTrack: ILocalAudioTrack | undefined,
      localVideoTrack: ILocalVideoTrack | undefined,
      leave: Function,
      join: Function,
      remoteUsers: IAgoraRTCRemoteUser[],
      volumeIndicator: Array<volume> | undefined,
      muteVideo: Function;
      muteVideoState: boolean;
      muteAudio: Function;
      muteAudioState: boolean;
      publishingClient: IAgoraRTCClient | undefined
    }
    {
  const [clients, setClients] = useState<IAgoraRTCClient[] | undefined>([])
  const [ publishingClient, setPublishingClient ] = useState<IAgoraRTCClient | undefined>(undefined)
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | undefined>(undefined);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | undefined>(undefined);
  const [volumeIndicator, setVolumeIndicator] = useState<Array<volume> | undefined>(undefined)
  const [muteVideoState, setMuteVideoState] = useState(false)
  const [muteAudioState, setMuteAudioState] = useState(false)

  const [remoteUsers, setRemoteUsers] = useState<IAgoraRTCRemoteUser[]>([]);

  async function createLocalTracks(audioConfig?: MicrophoneAudioTrackInitConfig, videoConfig?: CameraVideoTrackInitConfig)
  : Promise<[IMicrophoneAudioTrack, ICameraVideoTrack]> {
    const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(audioConfig, videoConfig);
    setLocalAudioTrack(microphoneTrack);
    setLocalVideoTrack(cameraTrack);
    return [microphoneTrack, cameraTrack];
  }

  const publishClient = async (publishingClient: IAgoraRTCClient,tracks: ILocalTrack[]) => {
    console.log("Publishing tracks...");
    await publishingClient.setClientRole('host');
    await publishingClient.publish(tracks);
    setPublishingClient(publishingClient)
  }

  async function join(newClient: IAgoraRTCClient, appid: string, channel: string, publish: boolean, token?: string, uid?: string | number | null) {
    if (!newClient) return;
    clients?.length ? await setClients([...clients, newClient]) : await setClients([newClient])
    console.log(`Joining: \nChannel: ${channel} \nClient: `, newClient, `\nAPP ID: ${appid} \nToken: ${token}`)
    console.log('CLIENTS!!!', publish, uid)
    let microphoneTrack, cameraTrack;
    if(publish){
      [microphoneTrack, cameraTrack] = await createLocalTracks();
    }
    
    await newClient.join(appid, channel, token || null);
    if(publish && microphoneTrack && cameraTrack){
      publishClient(newClient, [microphoneTrack, cameraTrack])
    }
    else {
      console.log("Skipping publishing tracks...");
      await newClient.setClientRole('audience')
    }
    await newClient.enableAudioVolumeIndicator();

    (window as any).newClient = newClient;
    (window as any).videoTrack = cameraTrack;
  }

  async function leave(client: IAgoraRTCClient, lastClient: boolean) {
    if(lastClient){
      if (localAudioTrack) {
        localAudioTrack.stop();
        localAudioTrack.close();
      }
      if (localVideoTrack) {
        localVideoTrack.stop();
        localVideoTrack.close();
        setLocalVideoTrack(undefined)
      }
      setRemoteUsers([]);
      setVolumeIndicator(undefined)  
    }
    console.log('Leaving client:', client)
    await client?.leave();
  }

  const muteVideo = async () => {
    localVideoTrack?.setEnabled(muteVideoState)
    setMuteVideoState(!muteVideoState)
  }
  const muteAudio = async () => {
    console.log("MuteAudioState: ", muteAudioState)
    localAudioTrack?.setEnabled(muteAudioState)
    setMuteAudioState(!muteAudioState)
  }

  useEffect(() => {
    if (!clients) return;
    clients.forEach(client => {
      
      setRemoteUsers(client.remoteUsers);

      const handleUserPublished = async (user: IAgoraRTCRemoteUser, mediaType: 'audio' | 'video') => {
        await client.subscribe(user, mediaType);
        if(mediaType === 'video')
        console.log("User published", user)
        // toggle rerender while state of remoteUsers changed.
        setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
      }
      const handleUserUnpublished = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
      }
      const handleUserJoined = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
      }
      const handleUserLeft = (user: IAgoraRTCRemoteUser) => {
        setRemoteUsers(remoteUsers => Array.from(client.remoteUsers));
      }
      const handleVolumeIndicator = (volumes: Array<volume> ) => {
        setVolumeIndicator(volumes)
      }
      client.on('user-published', handleUserPublished);
      client.on('user-unpublished', handleUserUnpublished);
      client.on('user-joined', handleUserJoined);
      client.on('user-left', handleUserLeft);
      client.on('volume-indicator', handleVolumeIndicator)

      return () => {
        client.off('user-published', handleUserPublished);
        client.off('user-unpublished', handleUserUnpublished);
        client.off('user-joined', handleUserJoined);
        client.off('user-left', handleUserLeft);
      };
    });
  }, [clients]);

  return {
    localAudioTrack,
    localVideoTrack,
    leave,
    join,
    remoteUsers,
    volumeIndicator,
    muteVideo,
    muteVideoState,
    muteAudio,
    muteAudioState,
    publishingClient
  };
}