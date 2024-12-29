import React, { useState } from 'react';
import {
    Box,
    VStack,
    Input,
    Button,
    Text,
    useToast,
    FormControl,
    FormLabel,
    InputGroup,
    InputLeftElement,
} from '@chakra-ui/react';
import { MdMeetingRoom, MdPerson } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const JoinMeeting = () => {
    const [meetingId, setMeetingId] = useState('');
    const [name, setName] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    const handleJoinMeeting = async () => {
        if (!meetingId.trim() || !name.trim()) {
            toast({
                title: 'Error',
                description: 'Please enter both meeting ID and your name',
                status: 'error',
                duration: 3000
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/meetings/${meetingId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name })
            });

            if (response.ok) {
                navigate(`/meeting-room/${meetingId}`);
            } else {
                throw new Error('Invalid meeting ID');
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to join meeting. Please check the meeting ID.',
                status: 'error',
                duration: 3000
            });
        }
    };

    return (
        <Box maxW="md" mx="auto" mt={8}>
            <VStack spacing={6} align="stretch" bg="white" p={8} borderRadius="lg" boxShadow="md">
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                    Join a Meeting
                </Text>

                <FormControl>
                    <FormLabel>Meeting ID</FormLabel>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <MdMeetingRoom color="gray.300" />
                        </InputLeftElement>
                        <Input
                            placeholder="Enter meeting ID"
                            value={meetingId}
                            onChange={(e) => setMeetingId(e.target.value)}
                        />
                    </InputGroup>
                </FormControl>

                <FormControl>
                    <FormLabel>Your Name</FormLabel>
                    <InputGroup>
                        <InputLeftElement pointerEvents="none">
                            <MdPerson color="gray.300" />
                        </InputLeftElement>
                        <Input
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </InputGroup>
                </FormControl>

                <Button
                    colorScheme="blue"
                    size="lg"
                    onClick={handleJoinMeeting}
                    leftIcon={<MdMeetingRoom />}
                >
                    Join Meeting
                </Button>
            </VStack>
        </Box>
    );
};

export default JoinMeeting;
