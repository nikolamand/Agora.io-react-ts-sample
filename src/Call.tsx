import React, { useState, useRef } from 'react';
import AgoraRTC, { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import useAgora from './hooks/useAgora';
import MediaPlayer from './components/MediaPlayer';
import JoinForm, { JoinData } from './components/JoinForm';
import './Call.css';

function Call() {

  const [ clients, setClients ] = useState<IAgoraRTCClient[]>([])

  const [ publishing, setPublishing ] = useState<boolean>(true)

  const {
    localAudioTrack, localVideoTrack, leave, join, remoteUsers, volumeIndicator, muteVideo, muteAudio, muteVideoState, muteAudioState, publishingClient
  } = useAgora();

  const addFormButton = useRef<HTMLButtonElement>(null)

  // const sendInitialData = () => {
  //   const sessionAppID = window.localStorage.getItem('Agora_Sample_appid');
  //   const sessionToken = window.localStorage.getItem('Agora_Sample_token');
  //   const sessionChannel = window.localStorage.getItem('Agora_Sample_channel');
  //   return {appid: sessionAppID, token: sessionToken, channel: sessionChannel}
  // }

  const handleAddJoinForm = () => {
    const newChannel = AgoraRTC.createClient({ codec: 'h264', mode: 'live'});
    clients.length ? setClients([ ...clients, newChannel]) : setClients([newChannel])
  }

  const handleJoinRequest = async (data: JoinData) => {
    if(data.appid && data.token && data.channel){
      join(data.client, data.appid, data.channel, publishing, data.token)
      setPublishing(false)
    }
    else{
      console.error("Can't join client, missing data!");
    }
  }

  const handleLeaveRequest = async (data: IAgoraRTCClient) => {
    if(data){
      const filterClients = clients.filter(client => client !== data)
      setClients(filterClients)
      filterClients.length ? leave(data) : leave(data, true)

    }
  }
  return (
    <div className='call'>
      <button ref={addFormButton} className="aditional-form-button" onClick={handleAddJoinForm}><i className="fas fa-plus-circle"></i></button>
      {
        clients.map((cl, index) => {
          return <JoinForm returnData={handleJoinRequest} returnLeave={handleLeaveRequest} client={cl} key={index}></JoinForm>
        })
      }

      <div className='player-container'>
        <div className='local-player-wrapper'>
          <p className='local-player-text'>{localVideoTrack && `localTrack`}{localVideoTrack ? `(${publishingClient?.uid})` : ''}</p>
          <MediaPlayer videoTrack={localVideoTrack} audioTrack={localAudioTrack} uid={publishingClient?.uid} volumeIndicator={volumeIndicator} ></MediaPlayer>
          {localVideoTrack ?
            <div className="controll-buttons">
              <div className="mute-video" onClick={()=>{muteVideo()}}><i 
                className={ muteVideoState ? "fas fa-video" : "fas fa-video-slash"}></i>
              </div>
              <div className="mute-audio" onClick={()=>{muteAudio()}}><i 
                className={ muteAudioState ? "fas fa-microphone" : "fas fa-microphone-slash"}></i>
              </div>
            </div>
            : ''
          }
        </div>
        {remoteUsers.map(user => (<div className='remote-player-wrapper' key={user.uid}>
            <p className='remote-player-text'>{`remoteVideo(${user.uid})`}</p>
            <MediaPlayer videoTrack={user.videoTrack} audioTrack={user.audioTrack} uid={user.uid} volumeIndicator={volumeIndicator}></MediaPlayer>
          </div>))}
      </div>
    </div>
  );
}

export default Call;
