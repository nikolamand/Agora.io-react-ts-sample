import React, { useRef, useState, useEffect, KeyboardEvent } from 'react'
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';

export interface JoinFormProps {
  returnData: Function
  client: IAgoraRTCClient
  key: number
  returnLeave: Function
  initialData?: {
    appid?: string | null
    token?: string | null
    channel?: string | null
  }
}
export interface JoinData {
  client: IAgoraRTCClient | undefined;
  appid: string | undefined;
  token: string | undefined;
  channel: string | undefined;
}
const JoinForm = (props: JoinFormProps) => {
  const [ joinData, setJoinData ] = useState<JoinData>()

  const [ client, setClient ] = useState<IAgoraRTCClient>()
  const [ leaveClient, setLeaveClient ] = useState<IAgoraRTCClient>()

  const appIdInput = useRef<HTMLInputElement>(null)
  const tokenInput = useRef<HTMLInputElement>(null)
  const channelInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if(props.initialData?.appid && props.initialData.token && appIdInput.current && tokenInput.current){
      appIdInput.current.value = props.initialData.appid
      tokenInput.current.value = props.initialData.token
    }
  }, [props.initialData])

  useEffect(() => {
    if(props.client)
      setClient(props.client)
  }, [props.client])

  useEffect(() => {
    if(joinData)
      props.returnData(joinData) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [joinData])

  useEffect(() => {
    if(leaveClient)
      props.returnLeave(leaveClient) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leaveClient]) 

  const saveField = (e: KeyboardEvent) => {
    const element = e.target as HTMLInputElement;
    const fieldName = element.name;
    const fieldValue = element.value;
    if(fieldValue && e.key === 'Enter'){
      window.localStorage.setItem(`Agora_Sample_${fieldName}`, fieldValue)
      console.log(`${fieldName} has been saved to localStorrage`)
    }
  }

  return (
    <div>
      <form className='call-form'>
        <div className="call-inputs">
          <label>
            AppID:
            <input ref={appIdInput} type='text' name='appid' id='appid' onKeyDown={saveField} />
          </label>
          <label>
            Token(Optional):
            <input ref={tokenInput} type='text' name='token' id='token' onKeyDown={saveField} />
          </label>
          <label>
            Channel:
            <input ref={channelInput} type='text' name='channel' />
          </label>
        </div>
        <div className='button-group'>
          <button id='join' type='button' className='btn btn-primary btn-sm' disabled={client?.uid ? true : false} onClick={() => {
            setJoinData({
              client: client,
              appid: appIdInput.current?.value,
              token: tokenInput.current?.value,
              channel: channelInput.current?.value
            });
            console.log("DATA:", joinData)
          }}>Join</button>
          <button id='leave' type='button' className='btn btn-primary btn-sm' disabled={client?.uid ? false : true} onClick={() => {setLeaveClient(client)}}>Leave</button>
        </div>
      </form>
      
    </div>
  )
}

export default JoinForm
