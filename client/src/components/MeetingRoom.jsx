import React, { useEffect, useRef, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import VideoControls from './VideoControls';
import ChatPanel from './ChatPanel';

const MeetingRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const userName = location.state?.userName || 'Anonymous';
  
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenShare, setScreenShare] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);

  useEffect(() => {
    socketRef.current = io('http://localhost:5001');
    
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        setStream(stream);
        userVideo.current.srcObject = stream;
        
        socketRef.current.emit('join-room', roomId, userName);
        
        socketRef.current.on('all-users', users => {
          const peers = [];
          users.forEach(user => {
            const peer = createPeer(user.socketId, socketRef.current.id, stream);
            peersRef.current.push({
              peerId: user.socketId,
              peer,
              userName: user.userName
            });
            peers.push({
              peerId: user.socketId,
              peer,
              userName: user.userName
            });
          });
          setPeers(peers);
        });

        socketRef.current.on('user-joined', payload => {
          const peer = addPeer(payload.signal, payload.callerId, stream);
          peersRef.current.push({
            peerId: payload.callerId,
            peer,
            userName: payload.userName
          });
          setPeers(users => [...users, {
            peerId: payload.callerId,
            peer,
            userName: payload.userName
          }]);
        });

        socketRef.current.on('user-left', userId => {
          const peerObj = peersRef.current.find(p => p.peerId === userId);
          if (peerObj) {
            peerObj.peer.destroy();
          }
          const peers = peersRef.current.filter(p => p.peerId !== userId);
          peersRef.current = peers;
          setPeers(peers);
        });

        socketRef.current.on('receiving-signal', payload => {
          const item = peersRef.current.find(p => p.peerId === payload.id);
          item.peer.signal(payload.signal);
        });
      });

    return () => {
      stream?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
    };
  }, [roomId, userName]);

  function createPeer(userToSignal, callerId, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('sending-signal', { userToSignal, callerId, signal });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on('signal', signal => {
      socketRef.current.emit('returning-signal', { signal, callerId });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks()[0].enabled = !videoEnabled;
      setVideoEnabled(!videoEnabled);
    }
  };

  const toggleScreenShare = async () => {
    if (!screenShare) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia();
        setScreenShare(screenStream);
        userVideo.current.srcObject = screenStream;
        
        // Update all peers with the new stream
        peers.forEach(({ peer }) => {
          peer.replaceTrack(
            stream.getVideoTracks()[0],
            screenStream.getVideoTracks()[0],
            stream
          );
        });

        screenStream.getVideoTracks()[0].onended = () => {
          userVideo.current.srcObject = stream;
          peers.forEach(({ peer }) => {
            peer.replaceTrack(
              screenStream.getVideoTracks()[0],
              stream.getVideoTracks()[0],
              stream
            );
          });
          setScreenShare(null);
        };
      } catch (err) {
        console.error('Error sharing screen:', err);
      }
    } else {
      screenShare.getTracks().forEach(track => track.stop());
      userVideo.current.srcObject = stream;
      peers.forEach(({ peer }) => {
        peer.replaceTrack(
          screenShare.getVideoTracks()[0],
          stream.getVideoTracks()[0],
          stream
        );
      });
      setScreenShare(null);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 grid grid-cols-2 gap-4 p-4">
          <div className="relative">
            <video
              ref={userVideo}
              muted
              autoPlay
              playsInline
              className="w-full h-full object-cover rounded-lg"
            />
            <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              You ({userName})
            </div>
          </div>
          {peers.map(({ peerId, peer, userName: peerName }, index) => (
            <div key={peerId} className="relative">
              <video
                ref={video => {
                  if (video && peer) {
                    video.srcObject = new MediaStream(peer._remoteStream);
                  }
                }}
                autoPlay
                playsInline
                className="w-full h-full object-cover rounded-lg"
              />
              <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 px-2 py-1 rounded">
                {peerName}
              </div>
            </div>
          ))}
        </div>
        
        <VideoControls
          audioEnabled={audioEnabled}
          videoEnabled={videoEnabled}
          screenShare={screenShare}
          toggleAudio={toggleAudio}
          toggleVideo={toggleVideo}
          toggleScreenShare={toggleScreenShare}
          toggleChat={() => setIsChatOpen(!isChatOpen)}
        />
      </div>

      {isChatOpen && (
        <ChatPanel
          roomId={roomId}
          userName={userName}
          socket={socketRef.current}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </div>
  );
};

export default MeetingRoom;
