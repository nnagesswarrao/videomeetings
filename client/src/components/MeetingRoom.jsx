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
const ParticipantTile = React.forwardRef(({ stream, userName, isLocal, isActive }, ref) => {
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
      border={isActive ? '3px solid blue' : 'none'}
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
const VideoGrid = ({ peers, stream, userVideo, activeSpeakerId }) => {
  const { colorMode } = useColorMode();
  const totalParticipants = peers.length + 1;

  const gridTemplateColumns = useMemo(() => {
    switch (totalParticipants) {
      case 1:
        return '1fr';
      case 2:
        return 'repeat(2, 1fr)';
      case 3:
      case 4:
        return 'repeat(2, 1fr)';
      default:
        return 'repeat(auto-fit, minmax(400px, 1fr))';
    }
  }, [totalParticipants]);

  return (
    <Grid
      templateColumns={gridTemplateColumns}
      gap={4}
      p={4}
      h="100%"
      maxH="calc(100vh - 100px)"
      overflow="hidden"
      bg={colorMode === 'dark' ? 'gray.800' : 'gray.100'}
    >
      {/* Local user video */}
      <GridItem>
        <ParticipantTile
          ref={userVideo}
          stream={stream}
          userName="You"
          isLocal={true}
          isActive={activeSpeakerId === 'local'}
        />
      </GridItem>

      {/* Remote peer videos */}
      {peers.map((peer, index) => {
        // Safely access the peer's stream
        const peerStream = peer?.peer?.streams?.[0] || null;
        
        return (
          <GridItem key={peer.peerId || index}>
            <ParticipantTile
              stream={peerStream}
              userName={peer.userName || `Participant ${index + 1}`}
              isLocal={false}
              isActive={activeSpeakerId === peer.peerId}
            />
          </GridItem>
        );
      })}
    </Grid>
  );
};

// Define drawer components outside of MeetingRoom
const ChatDrawer = ({ isOpen, onClose, userName, currentMessage, setCurrentMessage, sendMessage, chatMessages }) => (
  <Drawer 
    isOpen={isOpen}
    placement="right" 
    onClose={onClose}
    size="md"
    closeOnOverlayClick={false}
    closeOnEsc={false}
  >
    <DrawerOverlay backdropFilter="blur(4px)" />
    <DrawerContent bg="gray.900" color="white">
      <DrawerHeader borderBottomWidth="1px" borderColor="gray.700">
        Meeting Chat
        <DrawerCloseButton onClick={onClose} />
      </DrawerHeader>
      <DrawerBody>
        <VStack spacing={4} align="stretch" height="100%" overflowY="auto">
          {chatMessages.map((msg, index) => (
            <Flex 
              key={index} 
              direction="column" 
              align={msg.userName === userName ? "flex-end" : "flex-start"}
            >
              <Box
                bg={msg.userName === userName ? "blue.500" : "gray.700"}
                color="white"
                borderRadius="lg"
                px={4}
                py={2}
                maxW="80%"
              >
                <Text fontWeight="bold" fontSize="sm">
                  {msg.userName}
                </Text>
                <Text>{msg.text}</Text>
                <Text fontSize="xs" opacity={0.7}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </Text>
              </Box>
            </Flex>
          ))}
        </VStack>
      </DrawerBody>
      <DrawerFooter borderTopWidth="1px" borderColor="gray.700">
        <HStack width="full">
          <Input
            placeholder="Type your message"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            bg="gray.800"
            border="none"
            _focus={{ ring: 2, ringColor: "blue.500" }}
          />
          <Button
            colorScheme="blue"
            onClick={sendMessage}
            leftIcon={<FaPaperPlane />}
          >
            Send
          </Button>
        </HStack>
      </DrawerFooter>
    </DrawerContent>
  </Drawer>
);

const TranscriptDrawer = ({ isOpen, onClose, generateTranscript, chatMessages }) => (
  <Drawer 
    isOpen={isOpen}
    placement="right" 
    onClose={onClose}
    size="md"
    closeOnOverlayClick={false}
    closeOnEsc={false}
  >
    <DrawerOverlay backdropFilter="blur(4px)" />
    <DrawerContent bg="gray.900" color="white">
      <DrawerHeader borderBottomWidth="1px" borderColor="gray.700">
        Meeting Transcript
        <DrawerCloseButton onClick={onClose} />
      </DrawerHeader>
      <DrawerBody>
        <Textarea 
          value={generateTranscript(chatMessages)}
          height="100%"
          isReadOnly
          resize="none"
          bg="gray.800"
          border="none"
        />
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);

const AnalyticsDrawer = ({ isOpen, onClose, analytics }) => (
  <Drawer 
    isOpen={isOpen}
    placement="right" 
    onClose={onClose}
    size="md"
    closeOnOverlayClick={false}
    closeOnEsc={false}
  >
    <DrawerOverlay backdropFilter="blur(4px)" />
    <DrawerContent bg="gray.900" color="white">
      <DrawerHeader borderBottomWidth="1px" borderColor="gray.700">
        Meeting Analytics
        <DrawerCloseButton onClick={onClose} />
      </DrawerHeader>
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
            <Text>Meeting Duration: {analytics.meetingDuration}</Text>
          </HStack>
        </VStack>
      </DrawerBody>
    </DrawerContent>
  </Drawer>
);

const ParticipantsModal = ({ isOpen, onClose, userName, peers, raisedHandUsers, muteParticipant, removeParticipant }) => (
  <Modal 
    isOpen={isOpen}
    onClose={onClose}
    closeOnOverlayClick={false}
    closeOnEsc={false}
    size="xl"
    isCentered
  >
    <ModalOverlay backdropFilter="blur(4px)" />
    <ModalContent bg="gray.900" color="white">
      <ModalHeader borderBottomWidth="1px" borderColor="gray.700">
        Meeting Participants ({peers?.length + 1})
        <ModalCloseButton onClick={onClose} />
      </ModalHeader>
      <ModalBody p={6}>
        <VStack spacing={4} align="stretch">
          {[
            { name: userName, isLocal: true },
            ...(peers || []).map(p => ({ name: p.userName, isLocal: false }))
          ].map((participant, index) => (
            <Flex 
              key={index}
              justifyContent="space-between"
              alignItems="center"
              bg="gray.700"
              p={3}
              borderRadius="md"
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
                  <Badge colorScheme="green">You</Badge>
                )}
              </HStack>
              {!participant.isLocal && (
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="yellow"
                    onClick={() => muteParticipant(participant.name)}
                  >
                    <FaMicrophoneSlash />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="red"
                    onClick={() => removeParticipant(participant.name)}
                  >
                    <FaUserTimes />
                  </Button>
                </HStack>
              )}
            </Flex>
          ))}
        </VStack>
      </ModalBody>
    </ModalContent>
  </Modal>
);

const MeetingRoom = () => {
  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { 
    isOpen: isParticipantsOpen, 
    onOpen: onParticipantsOpen, 
    onClose: onParticipantsClose 
  } = useDisclosure({
    defaultIsOpen: false
  });
  const { colorMode } = useColorMode();

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
  
  // Modify drawer states
  const [drawerStates, setDrawerStates] = useState({
    chat: false,
    transcript: false,
    analytics: false,
    participants: false
  });

  // Drawer handlers
  const handleDrawerOpen = (drawerName) => {
    setDrawerStates(prev => ({
      ...prev,
      [drawerName]: true
    }));
  };

  const handleDrawerClose = (drawerName) => {
    setDrawerStates(prev => ({
      ...prev,
      [drawerName]: false
    }));
  };

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
          activeSpeakerId={activeSpeakerId}
        />
      </Box>
    );

    return participantLayout;
  }, [sortedParticipants, userVideo, activeSpeakerId]);

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

  // Create peer connection
  const createPeer = useCallback((userToSignal, callerId, stream) => {
    try {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream
      });

      peer.on('signal', signal => {
        socketRef.current?.emit('sending-signal', { 
          userToSignal, 
          callerId, 
          signal,
          userName 
        });
      });

      peer.on('stream', stream => {
        // Update peer's stream in peersRef
        const peerToUpdate = peersRef.current.find(p => p.peerId === userToSignal);
        if (peerToUpdate) {
          peerToUpdate.peer.streams = [stream];
          // Force update of peers state to trigger re-render
          setPeers([...peersRef.current]);
        }
      });

      peer.on('error', error => {
        console.error('Peer connection error:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to peer",
          status: "error",
          duration: 5000,
          isClosable: true
        });
      });

      return peer;
    } catch (error) {
      console.error('Error creating peer:', error);
      return null;
    }
  }, [userName, toast]);

  // Add peer connection
  const addPeer = useCallback((incomingSignal, callerId, stream, peerUserName) => {
    try {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream
      });

      peer.on('signal', signal => {
        socketRef.current?.emit('returning-signal', { signal, callerId });
      });

      peer.on('stream', stream => {
        // Update peer's stream in peersRef
        const peerToUpdate = peersRef.current.find(p => p.peerId === callerId);
        if (peerToUpdate) {
          peerToUpdate.peer.streams = [stream];
          // Force update of peers state to trigger re-render
          setPeers([...peersRef.current]);
        }
      });

      peer.on('error', error => {
        console.error('Peer connection error:', error);
      });

      // Signal the peer
      peer.signal(incomingSignal);

      return peer;
    } catch (error) {
      console.error('Error adding peer:', error);
      return null;
    }
  }, []);

  // Setup WebRTC and Socket connection
  useEffect(() => {
    if (!meetingDetails) return;

    let localStream = null;
    
    const setupSocketListeners = (stream) => {
      socketRef.current = io('http://localhost:5001');
      
      // Join room after getting media stream
      socketRef.current.emit('join-room', {
        roomId,
        userName,
        peerId: socketRef.current.id
      });

      // Listen for existing users in the room
      socketRef.current.on('all-users', users => {
        console.log('Received all users:', users);
        const peers = [];
        users.forEach(user => {
          console.log(`Creating peer for user: ${user.userName}`);
          const peer = createPeer(user.socketId, socketRef.current.id, stream);
          if (peer) {
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
          }
        });
        console.log('Setting peers:', peers);
        setPeers(peers);
      });

      // Listen for new users joining
      socketRef.current.on('user-joined', payload => {
        console.log('New user joined:', payload);
        const peer = addPeer(payload.signal, payload.callerId, stream, payload.userName);
        if (peer) {
          const peerObj = {
            peerId: payload.callerId,
            peer,
            userName: payload.userName
          };
          peersRef.current.push(peerObj);
          setPeers(users => [...users, peerObj]);
          console.log('Updated peers after user joined:', peersRef.current);
        }
      });

      // Handle returned signals
      socketRef.current.on('receiving-returned-signal', payload => {
        console.log('Received returned signal from:', payload.id);
        const item = peersRef.current.find(p => p.peerId === payload.id);
        if (item && item.peer) {
          item.peer.signal(payload.signal);
        }
      });

      // Handle user disconnection
      socketRef.current.on('user-left', userId => {
        console.log('User left:', userId);
        const peerToRemove = peersRef.current.find(p => p.peerId === userId);
        if (peerToRemove && peerToRemove.peer) {
          peerToRemove.peer.destroy();
        }
        const remainingPeers = peersRef.current.filter(p => p.peerId !== userId);
        peersRef.current = remainingPeers;
        setPeers(remainingPeers);
      });
    };

    const setupMediaStream = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const audioDevices = devices.filter(device => device.kind === 'audioinput');

        const constraints = {
          video: videoDevices.length > 0 ? { deviceId: videoDevices[0].deviceId } : false,
          audio: audioDevices.length > 0 ? { deviceId: audioDevices[0].deviceId } : false
        };

        console.log('Getting user media with constraints:', constraints);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('Got media stream:', mediaStream);
        
        localStream = mediaStream;
        setStream(mediaStream);
        
        if (userVideo.current) {
          userVideo.current.srcObject = mediaStream;
        }

        setupAudioLevelDetection(mediaStream);
        setupSocketListeners(mediaStream);

      } catch (error) {
        console.error('Media stream setup error:', error);
        toast({
          title: "Media Device Error",
          description: error.message || "Could not access camera or microphone",
          status: "error",
          duration: 5000,
          isClosable: true
        });
      }
    };

    setupMediaStream();


    // Cleanup function
    return () => {
      console.log('Cleaning up connections...');
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      peersRef.current.forEach(peer => {
        if (peer.peer) {
          peer.peer.destroy();
        }
      });
    };
  }, [meetingDetails, roomId, userName, toast]);

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

  // Sidebar buttons
  const SidebarButton = ({ icon, label, drawerName }) => (
    <Button
      leftIcon={icon}
      onClick={() => handleDrawerOpen(drawerName)}
      variant="ghost"
      justifyContent="flex-start"
      w="full"
      color={drawerStates[drawerName] ? "blue.400" : "white"}
      bg={drawerStates[drawerName] ? "whiteAlpha.100" : "transparent"}
      _hover={{ bg: "whiteAlpha.200" }}
    >
      {label}
    </Button>
  );

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

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Flex height="100vh" overflow="hidden">
      {/* Sidebar */}
      <Box
        w="250px"
        bg="gray.900"
        color="white"
        p={4}
        borderRight="1px solid"
        borderColor="gray.700"
      >
        <VStack spacing={6} align="stretch">
          <Box>
            <Text fontSize="xl" fontWeight="bold" mb={4}>
              {meetingDetails?.title || 'Meeting Room'}
            </Text>
            <HStack>
              <Badge colorScheme="green">
                {peers.length + 1} Participants
              </Badge>
              <Badge colorScheme="blue">
                {formatDuration(meetingDuration)}
              </Badge>
            </HStack>
          </Box>

          <VStack align="stretch" spacing={3}>
            <SidebarButton
              icon={<FaUsers />}
              label="Participants"
              drawerName="participants"
            />
            <SidebarButton
              icon={<FaComments />}
              label="Chat"
              drawerName="chat"
            />
            <SidebarButton
              icon={<FaFileAlt />}
              label="Transcript"
              drawerName="transcript"
            />
            <SidebarButton
              icon={<FaChartBar />}
              label="Analytics"
              drawerName="analytics"
            />
          </VStack>

          <Box mt="auto">
            <Button
              leftIcon={<FaPhoneSlash />}
              colorScheme="red"
              width="100%"
              onClick={leaveMeeting}
            >
              Leave Meeting
            </Button>
          </Box>
        </VStack>
      </Box>

      {/* Main Content */}
      <Flex flex="1" direction="column">
        {/* Video Grid */}
        <Box flex="1" bg="gray.800" position="relative">
          {renderParticipantLayout()}
          
          {/* Floating Controls */}
          <HStack
            position="absolute"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            spacing={2}
            bg="rgba(0, 0, 0, 0.6)"
            p={2}
            borderRadius="full"
            backdropFilter="blur(10px)"
          >
            <Tooltip label={audioEnabled ? 'Mute' : 'Unmute'}>
              <Button
                onClick={toggleAudio}
                colorScheme={audioEnabled ? "blue" : "red"}
                size="lg"
                borderRadius="full"
                variant="ghost"
              >
                {audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </Button>
            </Tooltip>

            <Tooltip label={videoEnabled ? 'Stop Video' : 'Start Video'}>
              <Button
                onClick={toggleVideo}
                colorScheme={videoEnabled ? "blue" : "red"}
                size="lg"
                borderRadius="full"
                variant="ghost"
              >
                {videoEnabled ? <FaVideo /> : <FaVideoSlash />}
              </Button>
            </Tooltip>

            <Tooltip label={screenShare ? 'Stop Sharing' : 'Share Screen'}>
              <Button
                onClick={toggleScreenShare}
                colorScheme={screenShare ? "green" : "blue"}
                size="lg"
                borderRadius="full"
                variant="ghost"
              >
                <FaDesktop />
              </Button>
            </Tooltip>

            <Tooltip label="Raise Hand">
              <Button
                onClick={raiseHand}
                colorScheme="yellow"
                size="lg"
                borderRadius="full"
                variant="ghost"
              >
                <FaHandPaper />
              </Button>
            </Tooltip>

            <Tooltip label={isRecording ? 'Stop Recording' : 'Start Recording'}>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                colorScheme={isRecording ? "red" : "purple"}
                size="lg"
                borderRadius="full"
                variant="ghost"
              >
                {isRecording ? <FaStopCircle /> : <FaRecordVinyl />}
              </Button>
            </Tooltip>
          </HStack>
        </Box>
      </Flex>

      {/* Drawers */}
      <ChatDrawer 
        isOpen={drawerStates.chat}
        onClose={() => handleDrawerClose('chat')}
        userName={userName}
        currentMessage={currentMessage}
        setCurrentMessage={setCurrentMessage}
        sendMessage={sendMessage}
        chatMessages={chatMessages}
      />
      <TranscriptDrawer 
        isOpen={drawerStates.transcript}
        onClose={() => handleDrawerClose('transcript')}
        generateTranscript={generateTranscript}
        chatMessages={chatMessages}
      />
      <AnalyticsDrawer 
        isOpen={drawerStates.analytics}
        onClose={() => handleDrawerClose('analytics')}
        analytics={calculateMeetingAnalytics(
          [{ name: userName, isLocal: true }, ...peers.map(p => ({ name: p.userName, isLocal: false }))],
          chatMessages,
          meetingDuration
        )}
      />
      <ParticipantsModal 
        isOpen={drawerStates.participants}
        onClose={() => handleDrawerClose('participants')}
        userName={userName}
        peers={peers}
        raisedHandUsers={raisedHandUsers}
        muteParticipant={muteParticipant}
        removeParticipant={removeParticipant}
      />
    </Flex>
  );
};

export default MeetingRoom;
