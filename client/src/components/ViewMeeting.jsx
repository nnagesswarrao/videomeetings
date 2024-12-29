import React, { useState } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    Badge,
    Divider,
    Tag,
    TagLabel,
    Icon,
    useToast,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    Flex,
    IconButton,
    Tooltip,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
} from '@chakra-ui/react';
import {
    MdVideoCall,
    MdAccessTime,
    MdPeople,
    MdLocationOn,
    MdDescription,
    MdRepeat,
    MdChat,
    MdNotifications,
    MdPersonAdd,
    MdAttachment,
    MdDownload,
} from 'react-icons/md';
import { formatDateTime } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const ViewMeeting = ({ meeting, onClose }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const now = new Date();
    const { isOpen: isChatOpen, onOpen: onChatOpen, onClose: onChatClose } = useDisclosure();
    const [chatMessages, setChatMessages] = useState([]); // You'll need to fetch this

    const handleJoinMeeting = () => {
        navigate(`/meeting/${meeting.id}`);
    };

    const handleAddParticipants = () => {
        navigate(`/meeting/participants/${meeting.id}`);
    };

    const handleSendNotification = async () => {
        try {
            // Implement notification sending logic
            await fetch(`http://localhost:5001/api/meetings/${meeting.id}/notify`, {
                method: 'POST'
            });
            toast({
                title: "Notifications Sent",
                description: "All participants have been notified",
                status: "success",
                duration: 3000
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to send notifications",
                status: "error",
                duration: 3000
            });
        }
    };

    const getMeetingStatus = () => {
        if (new Date(meeting.start_time) > now) {
            return { label: 'Upcoming', color: 'blue' };
        } else if (new Date(meeting.end_time) < now) {
            return { label: 'Completed', color: 'gray' };
        }
        return { label: 'In Progress', color: 'green' };
    };

    const isRunning = new Date(meeting.start_time) <= now && new Date(meeting.end_time) >= now;
    const isCompleted = new Date(meeting.end_time) < now;

    return (
        <>
            <VStack spacing={6} align="stretch" p={4}>
                {/* Meeting Title and Status */}
                <Box>
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="2xl" fontWeight="bold">
                            {meeting.title}
                        </Text>
                        <Badge 
                            colorScheme={getMeetingStatus().color}
                            fontSize="sm"
                            px={3}
                            py={1}
                            borderRadius="full"
                        >
                            {getMeetingStatus().label}
                        </Badge>
                    </HStack>
                </Box>

                <Divider />

                {/* Action Buttons */}
                <HStack spacing={3} wrap="wrap">
                    {/* Join Button - Only for running meetings */}
                    {isRunning && (
                        <Button
                            leftIcon={<MdVideoCall size={20} />}
                            colorScheme="blue"
                            size="md"
                            onClick={handleJoinMeeting}
                            flex="1"
                        >
                            Join Meeting
                        </Button>
                    )}

                    {/* Add Participants - For upcoming and running meetings */}
                    {!isCompleted && (
                        <Button
                            leftIcon={<MdPersonAdd size={20} />}
                            colorScheme="green"
                            size="md"
                            onClick={handleAddParticipants}
                            flex="1"
                        >
                            Add Participants
                        </Button>
                    )}

                    {/* Notify Button */}
                    <Button
                        leftIcon={<MdNotifications size={20} />}
                        colorScheme="purple"
                        size="md"
                        onClick={handleSendNotification}
                        flex="1"
                    >
                        Notify All
                    </Button>

                    {/* Chat Button */}
                    <Button
                        leftIcon={<MdChat size={20} />}
                        colorScheme="teal"
                        size="md"
                        onClick={onChatOpen}
                        flex="1"
                    >
                        Chat History
                    </Button>
                </HStack>

                <Divider />

                {/* Meeting Details */}
                <VStack spacing={4} align="stretch">
                    {/* Time */}
                    <HStack>
                        <Icon as={MdAccessTime} color="gray.500" boxSize={5} />
                        <Box>
                            <Text fontWeight="medium">Time</Text>
                            <Text color="gray.600">
                                {formatDateTime(meeting.start_time)} - {formatDateTime(meeting.end_time)}
                            </Text>
                            <Text color="gray.600">Duration: {meeting.duration} minutes</Text>
                        </Box>
                    </HStack>

                    {/* Recurrence */}
                    {meeting.recurrence !== 'none' && (
                        <HStack>
                            <Icon as={MdRepeat} color="gray.500" boxSize={5} />
                            <Box>
                                <Text fontWeight="medium">Recurrence</Text>
                                <Text color="gray.600" textTransform="capitalize">
                                    {meeting.recurrence}
                                </Text>
                            </Box>
                        </HStack>
                    )}

                    {/* Location/Channel */}
                    <HStack>
                        <Icon as={MdLocationOn} color="gray.500" boxSize={5} />
                        <Box>
                            <Text fontWeight="medium">Location</Text>
                            <Text color="gray.600">
                                {meeting.is_online_meeting ? 'Online Meeting' : meeting.location}
                            </Text>
                            {meeting.channel && (
                                <Text color="gray.600">Channel: {meeting.channel}</Text>
                            )}
                        </Box>
                    </HStack>

                    {/* Participants */}
                    <Box>
                        <HStack mb={2}>
                            <Icon as={MdPeople} color="gray.500" boxSize={5} />
                            <Text fontWeight="medium">Participants</Text>
                        </HStack>
                        <VStack align="stretch" pl={9} spacing={3}>
                            <Box>
                                <Text fontSize="sm" color="gray.600" mb={2}>
                                    Required ({meeting.required_attendees?.length || 0})
                                </Text>
                                <Flex flexWrap="wrap" gap={2}>
                                    {meeting.required_attendees?.map(attendee => (
                                        <Tag
                                            key={attendee.id}
                                            size="md"
                                            borderRadius="full"
                                            variant="subtle"
                                            colorScheme="blue"
                                        >
                                            <TagLabel>{attendee.username}</TagLabel>
                                        </Tag>
                                    ))}
                                </Flex>
                            </Box>
                        </VStack>
                    </Box>

                    {/* Attachments and Records - For completed meetings */}
                    {isCompleted && (
                        <Accordion allowMultiple>
                            <AccordionItem>
                                <h2>
                                    <AccordionButton>
                                        <Box flex="1" textAlign="left">
                                            <HStack>
                                                <Icon as={MdAttachment} color="gray.500" boxSize={5} />
                                                <Text fontWeight="medium">Attachments & Records</Text>
                                            </HStack>
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                </h2>
                                <AccordionPanel pb={4}>
                                    <VStack align="stretch" spacing={2}>
                                        {meeting.attachments?.map(attachment => (
                                            <HStack key={attachment.id} justify="space-between">
                                                <Text>{attachment.name}</Text>
                                                <IconButton
                                                    icon={<MdDownload />}
                                                    size="sm"
                                                    onClick={() => window.open(attachment.url)}
                                                    aria-label="Download"
                                                />
                                            </HStack>
                                        ))}
                                        {meeting.recording_url && (
                                            <HStack justify="space-between">
                                                <Text>Meeting Recording</Text>
                                                <IconButton
                                                    icon={<MdDownload />}
                                                    size="sm"
                                                    onClick={() => window.open(meeting.recording_url)}
                                                    aria-label="Download recording"
                                                />
                                            </HStack>
                                        )}
                                    </VStack>
                                </AccordionPanel>
                            </AccordionItem>
                        </Accordion>
                    )}

                    {/* Description */}
                    {meeting.description && (
                        <Box>
                            <HStack mb={2}>
                                <Icon as={MdDescription} color="gray.500" boxSize={5} />
                                <Text fontWeight="medium">Description</Text>
                            </HStack>
                            <Text color="gray.600" pl={9}>
                                {meeting.description}
                            </Text>
                        </Box>
                    )}
                </VStack>
            </VStack>

            {/* Chat History Drawer */}
            <Drawer
                isOpen={isChatOpen}
                placement="left"
                onClose={onChatClose}
                size="md"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">Chat History</DrawerHeader>
                    <DrawerBody>
                        <VStack spacing={4} align="stretch">
                            {chatMessages.map(message => (
                                <Box
                                    key={message.id}
                                    bg={message.isMe ? "blue.50" : "gray.50"}
                                    p={3}
                                    borderRadius="md"
                                >
                                    <Text fontWeight="bold" fontSize="sm">
                                        {message.sender}
                                    </Text>
                                    <Text>{message.content}</Text>
                                    <Text fontSize="xs" color="gray.500" textAlign="right">
                                        {formatDateTime(message.timestamp)}
                                    </Text>
                                </Box>
                            ))}
                            {chatMessages.length === 0 && (
                                <Text color="gray.500" textAlign="center">
                                    No chat messages available
                                </Text>
                            )}
                        </VStack>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    );
};

export default ViewMeeting; 