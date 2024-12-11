import React, { 
  useEffect, 
  useRef, 
  useState, 
  useCallback, 
  useMemo 
} from 'react';
import { 
  useParams, 
  useLocation, 
  useNavigate 
} from 'react-router-dom';
import { 
  Box, 
  VStack, 
  HStack, 
  Text, 
  Button, 
  useToast,
  Flex,
  Avatar,
  Badge,
  Tooltip,
  Input,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Textarea,
  Tag,
  TagLabel,
  TagRightIcon,
  useColorMode,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Grid,
  GridItem,
  Icon
} from '@chakra-ui/react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { 
  FaMicrophone, 
  FaMicrophoneSlash, 
  FaVideo, 
  FaVideoSlash, 
  FaDesktop, 
  FaUsers, 
  FaComments, 
  FaHandPaper, 
  FaSignOutAlt, 
  FaCog, 
  FaInfoCircle,
  FaExclamationTriangle,
  FaChartBar,
  FaFileAlt,
  FaPaperPlane,
  FaUserTimes,
  FaStopCircle,
  FaRecordVinyl,
  FaPhoneSlash
} from 'react-icons/fa';

// Icons
// import { FaExclamationTriangle } from 'react-icons/fa';

// Network Quality Indicator
const NetworkQualityIndicator = ({ quality }) => {
  const getColor = () => {
    if (quality > 80) return 'green';
    if (quality > 50) return 'yellow';
    return 'red';
  };

  return (
    <Box 
      w="10px" 
      h="10px" 
      borderRadius="full" 
      bg={getColor()}
    />
  );
};

// Participant Tile Component
const ParticipantTile = React.forwardRef(({ stream, userName, isLocal }, ref) => {
  const videoRef = useRef(null);
  const { colorMode } = useColorMode();
  const [isMuted, setIsMuted] = useState(false);
  const [networkQuality, setNetworkQuality] = useState(100);
  const [audioLevel, setAudioLevel] = useState(0);

  // Use the passed ref if provided, otherwise use the local ref
  const displayRef = ref || videoRef;

  useEffect(() => {
    if (stream && displayRef.current) {
      displayRef.current.srcObject = stream;
    }
  }, [stream, displayRef]);

  // Network quality simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkQuality(prev => Math.max(70, prev + (Math.random() * 10 - 5)));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Audio level detection
  useEffect(() => {
    if (stream) {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
      return () => audioContext.close();
    }
  }, [stream]);

  return (
    <Box
      position="relative"
      width="100%"
      height="100%"
      borderRadius="lg"
      overflow="hidden"
      bg={colorMode === 'dark' ? 'gray.700' : 'gray.200'}
      boxShadow="lg"
      transition="all 0.2s"
      _hover={{ transform: 'scale(1.02)' }}
    >
      <video
        ref={displayRef}
        autoPlay
        playsInline
        muted={isLocal}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: isLocal ? 'scaleX(-1)' : 'none'
        }}
      />
      
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        p={4}
        background="linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)"
        color="white"
      >
        <HStack justify="space-between">
          <HStack spacing={2}>
            <Avatar size="sm" name={userName} />
            <Text fontWeight="bold">{userName}</Text>
          </HStack>
          
          <HStack spacing={2}>
            <Tooltip label={`Network Quality: ${Math.round(networkQuality)}%`}>
              <Tag colorScheme={networkQuality > 90 ? 'green' : networkQuality > 70 ? 'yellow' : 'red'}>
                <TagLabel>{Math.round(networkQuality)}%</TagLabel>
              </Tag>
            </Tooltip>
            
            <Tooltip label={isMuted ? 'Unmute' : 'Mute'}>
              <Tag
                colorScheme={isMuted ? 'red' : 'green'}
                cursor="pointer"
                onClick={() => setIsMuted(!isMuted)}
              >
                <TagLabel>{isMuted ? 'Muted' : 'Unmuted'}</TagLabel>
              </Tag>
            </Tooltip>
            
            <Tooltip label={`Audio Level: ${Math.round(audioLevel * 100)}%`}>
              <Box
                w="20px"
                h="20px"
                borderRadius="full"
                bg={audioLevel > 0.5 ? 'green.500' : 'gray.500'}
                transition="all 0.2s"
              />
            </Tooltip>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
});

// Video Grid Layout Component
const VideoGrid = ({ peers, stream, userVideo }) => {
  const { colorMode } = useColorMode();
  const totalParticipants = peers.length + 1;
  
  // Calculate grid layout
  const gridTemplateAreas = useMemo(() => {
    switch(totalParticipants) {
      case 1:
        return '"main"';
      case 2:
        return '"main side"';
      case 3:
      case 4:
        return '"main main" "side1 side2"';
      default:
        return '"main main main" "side1 side2 side3" "side4 side5 side6"';
    }
  }, [totalParticipants]);

  const gridTemplateColumns = useMemo(() => {
    switch(totalParticipants) {
      case 1:
        return '1fr';
      case 2:
        return '2fr 1fr';
      case 3:
      case 4:
        return 'repeat(2, 1fr)';
      default:
        return 'repeat(3, 1fr)';
    }
  }, [totalParticipants]);

  return (
    <Grid
      templateAreas={gridTemplateAreas}
      templateColumns={gridTemplateColumns}
      gap={4}
      p={4}
      h="100%"
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
    >
      <GridItem area="main">
        <ParticipantTile
          ref={userVideo}
          stream={stream}
          userName="You"
          isLocal={true}
        />
      </GridItem>
      {peers.map((peer, index) => (
        <GridItem 
          key={peer.peerId}
          area={index === 0 && totalParticipants === 2 ? 'side' : `side${index + 1}`}
        >
          <ParticipantTile
            stream={peer.peer.streams?.[0]}
            userName={peer.userName}
            isLocal={false}
          />
        </GridItem>
      ))}
    </Grid>
  );
};

const MeetingRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { 
    isOpen: isParticipantsOpen, 
    onOpen: onParticipantsOpen, 
    onClose: onParticipantsClose 
  } = useDisclosure();

  // User and meeting state
  const [userName, setUserName] = useState(location.state?.userName || 'Anonymous');
  const [meetingDetails, setMeetingDetails] = useState(null);
  
  // Media and connection states
  const [peers, setPeers] = useState([]);
  const [stream, setStream] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [screenShare, setScreenShare] = useState(null);
  const [activeSpeakerId, setActiveSpeakerId] = useState(null);
  
  // Advanced meeting features
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);
  const [raisedHandUsers, setRaisedHandUsers] = useState([]);
  
  // Audio and network states
  const [audioLevels, setAudioLevels] = useState({});
  const [networkQualities, setNetworkQualities] = useState({});
  
  // Refs for managing connections
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  // New state for chat and meeting features
  const [chatMessages, setChatMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [meetingStartTime, setMeetingStartTime] = useState(null);
  const [meetingDuration, setMeetingDuration] = useState(0);
  
  // Drawer states for chat, transcript, and analytics
  const {
    isOpen: isChatOpen,
    onOpen: onChatOpen,
    onClose: onChatClose
  } = useDisclosure();
  const {
    isOpen: isTranscriptOpen,
    onOpen: onTranscriptOpen,
    onClose: onTranscriptClose
  } = useDisclosure();
  const {
    isOpen: isAnalyticsOpen,
    onOpen: onAnalyticsOpen,
    onClose: onAnalyticsClose
  } = useDisclosure();

  // Prepare sorted participants for rendering
  const sortedParticipants = useMemo(() => {
    const allParticipants = [
      { 
        stream, 
        userName: 'You', 
        isLocal: true, 
        muted: !audioEnabled,
        id: 'local',
        audioLevel: audioLevels['local'] || 0,
        networkQuality: 'excellent'
      },
      ...peers.map(({ peer, userName: peerName, peerId }) => ({ 
        stream: peer.streams?.[0], 
        userName: peerName, 
        isLocal: false, 
        muted: false,
        id: peerId,
        audioLevel: audioLevels[peerId] || 0,
        networkQuality: networkQualities[peerId] || 'good'
      }))
    ];

    // Sort participants to show active speaker first
    return [...allParticipants].sort((a, b) => {
      if (a.id === activeSpeakerId) return -1;
      if (b.id === activeSpeakerId) return 1;
      return b.audioLevel - a.audioLevel;
    });
  }, [stream, peers, audioEnabled, audioLevels, networkQualities, activeSpeakerId]);

  // Render participant layout function
  const renderParticipantLayout = useCallback(() => {
    const participantLayout = (
      <Box
        flex={1}
        overflowY="auto"
        bg="gray.900"
      >
        <VideoGrid 
          peers={sortedParticipants.slice(1)}
          stream={sortedParticipants[0]?.stream}
          userVideo={userVideo}
        />
      </Box>
    );

    return participantLayout;
  }, [sortedParticipants, userVideo]);

  // Setup audio level detection
  const setupAudioLevelDetection = useCallback((mediaStream) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(mediaStream);
      
      analyserRef.current = audioContextRef.current.createAnalyser();
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
    }

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const detectAudioLevels = () => {
      analyserRef.current.getByteFrequencyData(dataArray);
      const averageLevel = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength / 255;
      
      // Update local audio level
      setAudioLevels(prev => ({
        ...prev,
        local: averageLevel
      }));

      // Request next animation frame
      requestAnimationFrame(detectAudioLevels);
    };

    detectAudioLevels();
  }, []);

  // Fetch meeting details and setup media stream
  useEffect(() => {
    const fetchMeetingDetails = async () => {
      try {
        const response = await fetch(`/api/meetings/${roomId}`);
        if (!response.ok) {
          throw new Error('Meeting not found');
        }
        const details = await response.json();
        setMeetingDetails(details);
      } catch (error) {
        toast({
          title: "Meeting Error",
          description: "Could not fetch meeting details",
          status: "error",
          duration: 3000,
          isClosable: true
        });
        navigate('/meetings');
      }
    };

    fetchMeetingDetails();
  }, [roomId, navigate, toast]);

  // Peer connection methods with improved logic
  function createPeer(userToSignal, callerId, stream) {
    console.log(`Creating peer for: 
      User to Signal: ${userToSignal}, 
      Caller ID: ${callerId}`);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream
    });

    peer.on('signal', signal => {
      console.log(`Sending signal to: ${userToSignal}`);
      socketRef.current.emit('sending-signal', { 
        userToSignal, 
        callerId, 
        signal,
        userName: userName
      });
    });

    peer.on('stream', remoteStream => {
      console.log(`Received remote stream from: ${callerId}`);
      // Update peer's stream in the peers state
      setPeers(prevPeers => {
        const peerToUpdate = prevPeers.find(p => p.peerId === userToSignal);
        if (peerToUpdate) {
          peerToUpdate.peer.streams = [remoteStream];
          return [...prevPeers];
        }
        return prevPeers;
      });
    });

    peer.on('error', err => {
      console.error('Peer error:', err);
      toast({
        title: "Connection Error",
        description: "Failed to connect to peer",
        status: "error",
        duration: 3000
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerId, stream, userName) {
    console.log(`Adding peer: 
      Caller ID: ${callerId}, 
      User Name: ${userName}`);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream
    });

    peer.on('signal', signal => {
      console.log(`Returning signal to: ${callerId}`);
      socketRef.current.emit('returning-signal', { 
        signal, 
        callerId,
        userName: userName
      });
    });

    peer.on('stream', remoteStream => {
      console.log(`Received remote stream from: ${callerId}`);
      // Update peer's stream in the peers state
      setPeers(prevPeers => {
        const peerToUpdate = prevPeers.find(p => p.peerId === callerId);
        if (peerToUpdate) {
          peerToUpdate.peer.streams = [remoteStream];
          return [...prevPeers];
        }
        return prevPeers;
      });
    });

    peer.on('error', err => {
      console.error('Peer error:', err);
      toast({
        title: "Connection Error",
        description: "Failed to connect to peer",
        status: "error",
        duration: 3000
      });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  // Setup WebRTC and Socket connection
  useEffect(() => {
    if (!meetingDetails) return;

    socketRef.current = io('http://localhost:5001');
    
    const setupMediaStream = async () => {


      
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setupAudioLevelDetection(mediaStream);
        
        setStream(mediaStream);
        if (userVideo.current) {
          userVideo.current.srcObject = mediaStream;
        }
        
        console.log('Joining room:', {
          roomId, 
          userName, 
          meetingId: meetingDetails.id
        });

        socketRef.current.emit('join-room', {
          roomId, 
          userName, 
          meetingId: meetingDetails.id
        });
        
        socketRef.current.on('all-users', users => {
          console.log('Received all users:', users);
          
          const newPeers = users.map(user => {
            console.log(`Creating peer for user: ${user.userName}`);
            const peer = createPeer(user.socketId, socketRef.current.id, mediaStream);
            
            return {
              peerId: user.socketId,
              peer,
              userName: user.userName
            };
          });

          setPeers(newPeers);
          peersRef.current = newPeers;
        });

        socketRef.current.on('user-joined', payload => {
          console.log('User joined:', payload);
          
          const peer = addPeer(
            payload.signal, 
            payload.callerId, 
            mediaStream, 
            payload.userName
          );

          const peerObj = {
            peerId: payload.callerId,
            peer,
            userName: payload.userName
          };

          setPeers(prevPeers => {
            const updatedPeers = [...prevPeers, peerObj];
            peersRef.current = updatedPeers;
            return updatedPeers;
          });
        });

        socketRef.current.on('receiving-returned-signal', payload => {
          console.log('Received returned signal:', payload);
          const item = peersRef.current.find(p => p.peerId === payload.id);
          if (item) {
            item.peer.signal(payload.signal);
          }
        });

        socketRef.current.on('user-left', userId => {
          console.log('User left:', userId);
          const peerToRemove = peersRef.current.find(p => p.peerId === userId);
          if (peerToRemove) {
            peerToRemove.peer.destroy();
          }

          const filteredPeers = peersRef.current.filter(p => p.peerId !== userId);
          peersRef.current = filteredPeers;
          setPeers(filteredPeers);
        });

      } catch (error) {
        console.error('Media stream setup error:', error);
        toast({
          title: "Media Access Error",
          description: "Could not access camera or microphone",
          status: "error",
          duration: 3000,
          isClosable: true,
          icon: <FaExclamationTriangle />
        });
      }
    };

    setupMediaStream();

    return () => {
      peersRef.current.forEach(({ peer }) => {
        peer.destroy();
      });
      stream?.getTracks().forEach(track => track.stop());
      socketRef.current?.disconnect();
    };
  }, [meetingDetails, userName, toast, setupAudioLevelDetection]);

  // Screen Sharing Implementation
  const toggleScreenShare = async () => {
    if (screenShare) {
      // Stop screen share
      screenShare.getTracks().forEach(track => track.stop());
      setScreenShare(null);
      
      // Switch back to camera stream
      const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(videoStream);
      
      // Notify peers about stream change
      socketRef.current.emit('stream-changed', { 
        roomId, 
        streamType: 'camera' 
      });
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true 
        });
        
        // Stop original video stream
        stream.getTracks().forEach(track => track.stop());
        
        setScreenShare(screenStream);
        setStream(screenStream);
        
        // Notify peers about screen share
        socketRef.current.emit('stream-changed', { 
          roomId, 
          streamType: 'screen' 
        });
        
        // Handle screen share end
        screenStream.getVideoTracks()[0].onended = () => {
          toggleScreenShare();
        };
      } catch (error) {
        toast({
          title: "Screen Share Error",
          description: "Could not start screen sharing",
          status: "error",
          duration: 3000
        });
      }
    }
  };

  // Recording Functionality
  const startRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    
    const chunks = [];
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };
    
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      
      // Offer download
      const a = document.createElement('a');
      a.href = url;
      a.download = `meeting_recording_${new Date().toISOString()}.webm`;
      a.click();
      
      setRecordedChunks(chunks);
      setIsRecording(false);
    };

    mediaRecorder.start();
    setIsRecording(true);
    
    toast({
      title: "Recording Started",
      description: "Meeting is now being recorded",
      status: "info",
      duration: 3000
    });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  // Participant Management
  const raiseHand = () => {
    socketRef.current.emit('raise-hand', { 
      roomId, 
      userName 
    });
  };

  const muteParticipant = (participantId) => {
    socketRef.current.emit('mute-participant', { 
      roomId, 
      participantId 
    });
  };

  const removeParticipant = (participantId) => {
    socketRef.current.emit('remove-participant', { 
      roomId, 
      participantId 
    });
  };

  // Socket event listeners for advanced features
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('hand-raised', ({ userName }) => {
      setRaisedHandUsers(prev => [...prev, userName]);
      
      toast({
        title: "Hand Raised",
        description: `${userName} wants to speak`,
        status: "info",
        duration: 3000
      });
    });

    socketRef.current.on('participant-removed', ({ userName }) => {
      toast({
        title: "Participant Removed",
        description: `${userName} was removed from the meeting`,
        status: "warning",
        duration: 3000
      });
    });

    return () => {
      socketRef.current?.off('hand-raised');
      socketRef.current?.off('participant-removed');
    };
  }, [toast]);

  // Utility functions for transcript and analytics
  const generateTranscript = (messages) => {
    return messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.userName}: ${msg.text}`
    ).join('\n');
  };

  const calculateMeetingAnalytics = (participants, messages, duration) => {
    return {
      totalParticipants: participants.length,
      messageSent: messages.length,
      averageMessagePerParticipant: messages.length / participants.length,
      meetingDuration: duration,
      mostActiveParticipant: participants.reduce((max, participant) => {
        const messageCount = messages.filter(m => m.userName === participant.name).length;
        return messageCount > max.messageCount 
          ? { name: participant.name, messageCount } 
          : max;
      }, { name: '', messageCount: 0 })
    };
  };

  // Meeting duration tracking
  useEffect(() => {
    if (!meetingStartTime) {
      setMeetingStartTime(new Date());
    }

    const intervalId = setInterval(() => {
      if (meetingStartTime) {
        const duration = Math.floor((new Date() - meetingStartTime) / 1000);
        setMeetingDuration(duration);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [meetingStartTime]);

  // Chat functionality
  const sendMessage = () => {
    if (currentMessage.trim() === '') return;

    const message = {
      text: currentMessage,
      userName: userName,
      timestamp: new Date().toISOString()
    };

    // Send message via socket
    socketRef.current.emit('chat-message', {
      roomId,
      message
    });

    // Update local chat messages
    setChatMessages(prev => [...prev, message]);
    setCurrentMessage('');
  };

  // Socket listeners for chat
  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on('receive-chat-message', (message) => {
      setChatMessages(prev => [...prev, message]);
    });

    return () => {
      socketRef.current?.off('receive-chat-message');
    };
  }, []);

  // Transcript and Analytics Drawers
  const TranscriptDrawer = () => (
    <Drawer 
      isOpen={isTranscriptOpen} 
      placement="right" 
      onClose={onTranscriptClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Meeting Transcript</DrawerHeader>
        <DrawerBody>
          <Textarea 
            value={generateTranscript(chatMessages)}
            height="100%"
            isReadOnly
            resize="none"
          />
        </DrawerBody>
        <DrawerFooter>
          <Button 
            colorScheme="blue" 
            onClick={() => {
              const transcript = generateTranscript(chatMessages);
              const blob = new Blob([transcript], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `meeting_transcript_${new Date().toISOString()}.txt`;
              a.click();
            }}
          >
            Download Transcript
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  const AnalyticsDrawer = () => {
    const analytics = calculateMeetingAnalytics(
      [
        { name: userName, isLocal: true },
        ...peers.map(p => ({ name: p.userName, isLocal: false }))
      ],
      chatMessages,
      meetingDuration
    );

    return (
      <Drawer 
        isOpen={isAnalyticsOpen} 
        placement="right" 
        onClose={onAnalyticsClose}
        size="md"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Meeting Analytics</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <HStack>
                <FaUsers />
                <Text>Total Participants: {analytics.totalParticipants}</Text>
              </HStack>
              <HStack>
                <FaComments />
                <Text>Messages Sent: {analytics.messageSent}</Text>
              </HStack>
              <HStack>
                <FaChartBar />
                <Text>Avg. Messages per Participant: {analytics.averageMessagePerParticipant.toFixed(2)}</Text>
              </HStack>
              <HStack>
                <FaFileAlt />
                <Text>Meeting Duration: {formatDuration(analytics.meetingDuration)}</Text>
              </HStack>
              <HStack>
                <FaInfoCircle />
                <Text>Most Active Participant: {analytics.mostActiveParticipant.name}</Text>
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  };

  // Chat Drawer
  const ChatDrawer = () => (
    <Drawer 
      isOpen={isChatOpen} 
      placement="right" 
      onClose={onChatClose}
      size="md"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>Meeting Chat</DrawerHeader>
        <DrawerBody>
          <VStack spacing={4} align="stretch" height="100%" overflowY="auto">
            {chatMessages.map((msg, index) => (
              <Flex 
                key={index} 
                direction="column" 
                align={msg.userName === userName ? "flex-end" : "flex-start"}
              >
                <Tag 
                  size="md" 
                  variant="solid" 
                  colorScheme={msg.userName === userName ? "blue" : "green"}
                >
                  <TagLabel>{msg.text}</TagLabel>
                  <TagRightIcon as={FaInfoCircle} />
                </Tag>
                <Text fontSize="xs" color="gray.500">
                  {msg.userName} at {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </Flex>
            ))}
          </VStack>
        </DrawerBody>
        <DrawerFooter>
          <HStack width="full">
            <Input 
              placeholder="Type your message" 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button 
              colorScheme="blue" 
              onClick={sendMessage}
            >
              <FaPaperPlane />
            </Button>
          </HStack>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );

  // Utility function to format duration
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const ParticipantsModal = ({ 
    isOpen, 
    onClose, 
    userName, 
    peers, 
    raisedHandUsers, 
    muteParticipant, 
    removeParticipant 
  }) => {
    const { colorMode } = useColorMode();

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay 
          bg={colorMode === 'dark' ? 'blackAlpha.700' : 'whiteAlpha.700'}
          backdropFilter='blur(10px)'
        />
        <ModalContent 
          bg={colorMode === 'dark' ? 'gray.800' : 'white'}
          borderRadius="xl"
          boxShadow="2xl"
        >
          <ModalHeader 
            bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            borderTopRadius="xl"
            display="flex"
            alignItems="center"
          >
            <FaUsers style={{ marginRight: '10px' }} />
            <Text>Meeting Participants</Text>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <VStack spacing={4} align="stretch">
              {[
                { name: userName, isLocal: true },
                ...peers.map(p => ({ name: p.userName, isLocal: false }))
              ].map((participant, index) => (
                <Flex 
                  key={index} 
                  justifyContent="space-between"
                  alignItems="center"
                  bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
                  p={3}
                  borderRadius="md"
                  transition="all 0.3s"
                  _hover={{
                    bg: colorMode === 'dark' ? 'gray.600' : 'gray.200',
                    transform: 'scale(1.02)'
                  }}
                >
                  <HStack spacing={3}>
                    <Avatar 
                      name={participant.name} 
                      size="sm" 
                      bg={participant.isLocal ? "green.500" : "blue.500"}
                    />
                    <Text fontWeight="medium">{participant.name}</Text>
                    {raisedHandUsers.includes(participant.name) && (
                      <FaHandPaper color="orange" />
                    )}
                    {participant.isLocal && (
                      <Badge colorScheme="green" ml={2}>You</Badge>
                    )}
                  </HStack>
                  {!participant.isLocal && (
                    <HStack spacing={2}>
                      <Tooltip label="Mute Participant">
                        <Button 
                          size="sm" 
                          variant="outline"
                          colorScheme="yellow"
                          onClick={() => muteParticipant(participant.name)}
                        >
                          <FaMicrophoneSlash />
                        </Button>
                      </Tooltip>
                      <Tooltip label="Remove Participant">
                        <Button 
                          size="sm" 
                          variant="outline"
                          colorScheme="red"
                          onClick={() => removeParticipant(participant.name)}
                        >
                          <FaUserTimes />
                        </Button>
                      </Tooltip>
                    </HStack>
                  )}
                </Flex>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter 
            bg={colorMode === 'dark' ? 'gray.700' : 'gray.100'}
            borderBottomRadius="xl"
          >
            <Button onClick={onClose} colorScheme="blue">Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  };

  // Media control methods
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

  const leaveMeeting = () => {
    // Stop all media tracks
    stream?.getTracks().forEach(track => track.stop());
    
    // Disconnect socket
    socketRef.current?.disconnect();
    
    // Navigate back to meetings page
    navigate('/meetings');
  };

  return (
    <Box display="flex" flexDirection="column" height="100vh">
      {/* Meeting Header */}
      <Box 
        bg="blue.500" 
        color="white" 
        p={4} 
        display="flex"
        justifyContent="space-between"
        alignItems="center"
      >
        <Text fontSize="xl">{meetingDetails?.title || 'Meeting Room'}</Text>
        <HStack spacing={4}>
          <Badge colorScheme="green">
            Participants: {peers.length + 1}
          </Badge>
          <Text>Duration: {formatDuration(meetingDuration)}</Text>
          <Tooltip label="Participants">
            <Button onClick={onParticipantsOpen} variant="ghost" color="white">
              <FaUsers />
            </Button>
          </Tooltip>
          <Tooltip label="Chat">
            <Button onClick={onChatOpen} variant="ghost" color="white">
              <FaComments />
            </Button>
          </Tooltip>
          <Tooltip label="Transcript">
            <Button onClick={onTranscriptOpen} variant="ghost" color="white">
              <FaFileAlt />
            </Button>
          </Tooltip>
          <Tooltip label="Analytics">
            <Button onClick={onAnalyticsOpen} variant="ghost" color="white">
              <FaChartBar />
            </Button>
          </Tooltip>
        </HStack>
      </Box>

      {/* Video Layout */}
      <Box 
        flex={1} 
        p={4} 
        bg="gray.900"
      >
        {renderParticipantLayout()}
      </Box>

      {/* Video Controls */}
      <HStack 
        justifyContent="center" 
        spacing={4} 
        p={4} 
        bg="gray.800"
      >
        <Button 
          onClick={toggleAudio} 
          colorScheme={audioEnabled ? "blue" : "red"}
        >
          {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </Button>
        
        <Button 
          onClick={toggleVideo} 
          colorScheme={videoEnabled ? "blue" : "red"}
        >
          {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
        </Button>
        
        <Button 
          onClick={toggleScreenShare} 
          colorScheme={screenShare ? "green" : "blue"}
        >
          <FaDesktop />
        </Button>
        
        <Button 
          onClick={raiseHand} 
          colorScheme="yellow"
        >
          <FaHandPaper />
        </Button>
        
        <Button 
          onClick={isRecording ? stopRecording : startRecording}
          colorScheme={isRecording ? "red" : "purple"}
        >
          {isRecording ? <FaStopCircle /> : <FaRecordVinyl />}
        </Button>
        
        <Button 
          onClick={leaveMeeting} 
          colorScheme="red"
        >
          <FaPhoneSlash />
        </Button>
      </HStack>

      {/* Participants Modal */}
      <ParticipantsModal 
        isOpen={isParticipantsOpen}
        onClose={onParticipantsClose}
        userName={userName}
        peers={peers}
        raisedHandUsers={raisedHandUsers}
        muteParticipant={muteParticipant}
        removeParticipant={removeParticipant}
      />

      {/* New Drawers */}
      <ChatDrawer />
      <TranscriptDrawer />
      <AnalyticsDrawer />
    </Box>
  );
};

export default MeetingRoom;
