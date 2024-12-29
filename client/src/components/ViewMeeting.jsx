import React from 'react';
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
} from '@chakra-ui/react';
import {
    MdVideoCall,
    MdAccessTime,
    MdPeople,
    MdLocationOn,
    MdDescription,
    MdRepeat,
} from 'react-icons/md';
import { formatDateTime } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';

const ViewMeeting = ({ meeting, onClose }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const now = new Date();

    const handleJoinMeeting = () => {
        navigate(`/meeting/${meeting.id}`);
    };

    const getMeetingStatus = () => {
        if (new Date(meeting.start_time) > now) {
            return { label: 'Upcoming', color: 'blue' };
        } else if (new Date(meeting.end_time) < now) {
            return { label: 'Completed', color: 'gray' };
        }
        return { label: 'In Progress', color: 'green' };
    };

    return (
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

            {/* Join Button - Only for upcoming or in-progress meetings */}
            {new Date(meeting.end_time) > now && (
                <Button
                    leftIcon={<MdVideoCall size={20} />}
                    colorScheme="blue"
                    size="lg"
                    onClick={handleJoinMeeting}
                    w="full"
                >
                    Join Meeting
                </Button>
            )}

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
                            <Box display="flex" flexWrap="wrap" gap={2}>
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
                            </Box>
                        </Box>
                    </VStack>
                </Box>

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
    );
};

export default ViewMeeting; 