import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    Input,
    VStack,
    HStack,
    Text,
    Box,
    useToast,
    Tag,
    TagLabel,
    TagCloseButton,
    List,
    ListItem,
    Spinner,
    Center
} from '@chakra-ui/react';

const AddParticipantsDialog = ({ isOpen, onClose, meetingId, onParticipantsAdded }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [participants, setParticipants] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchParticipants();
        }
    }, [isOpen]);

    const fetchParticipants = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('http://localhost:5001/api/participants/all');
            const data = await response.json();
            setParticipants(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching participants:', error);
            setParticipants([]);
            toast({
                title: 'Error fetching participants',
                description: 'Failed to load participants data',
                status: 'error',
                duration: 3000
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        if (!Array.isArray(participants)) {
            console.error('Participants is not an array:', participants);
            return;
        }

        const filteredResults = participants.filter(participant => {
            if (!participant) return false;
            const alreadySelected = selectedParticipants.some(p => p.id === participant.id);
            return !alreadySelected && (
                participant.username?.toLowerCase().includes(query.toLowerCase()) ||
                participant.email?.toLowerCase().includes(query.toLowerCase())
            );
        });
        setSearchResults(filteredResults);
    };

    const handleSelectParticipant = (participant) => {
        setSelectedParticipants(prev => [...prev, participant]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveParticipant = (participantId) => {
        setSelectedParticipants(prev => prev.filter(p => p.id !== participantId));
    };

    const handleAddParticipants = async () => {
        if (selectedParticipants.length === 0) {
            toast({
                title: 'No participants selected',
                status: 'warning',
                duration: 3000
            });
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/meetings/${meetingId}/participants`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participantIds: selectedParticipants.map(p => p.id)
                }),
            });

            if (response.ok) {
                toast({
                    title: 'Participants added successfully',
                    status: 'success',
                    duration: 3000
                });
                onParticipantsAdded?.();
                onClose();
            } else {
                throw new Error('Failed to add participants');
            }
        } catch (error) {
            toast({
                title: 'Error adding participants',
                description: error.message,
                status: 'error',
                duration: 3000
            });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Participants</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <Input
                            placeholder="Search participants..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            isDisabled={isLoading}
                        />

                        {isLoading && (
                            <Center py={4}>
                                <Spinner />
                            </Center>
                        )}

                        {!isLoading && searchResults.length > 0 && (
                            <List spacing={2} w="100%">
                                {searchResults.map(participant => (
                                    <ListItem
                                        key={participant.id}
                                        p={2}
                                        bg="gray.50"
                                        borderRadius="md"
                                        cursor="pointer"
                                        _hover={{ bg: 'gray.100' }}
                                        onClick={() => handleSelectParticipant(participant)}
                                    >
                                        <Text fontWeight="medium">{participant.username}</Text>
                                        <Text fontSize="sm" color="gray.600">{participant.email}</Text>
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        {selectedParticipants.length > 0 && (
                            <Box w="100%">
                                <Text mb={2} fontWeight="medium">Selected Participants:</Text>
                                <HStack spacing={2} flexWrap="wrap">
                                    {selectedParticipants.map(participant => (
                                        <Tag
                                            key={participant.id}
                                            size="md"
                                            borderRadius="full"
                                            variant="solid"
                                            colorScheme="blue"
                                            m={1}
                                        >
                                            <TagLabel>{participant.username}</TagLabel>
                                            <TagCloseButton
                                                onClick={() => handleRemoveParticipant(participant.id)}
                                            />
                                        </Tag>
                                    ))}
                                </HStack>
                            </Box>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        colorScheme="blue" 
                        onClick={handleAddParticipants}
                        isDisabled={selectedParticipants.length === 0 || isLoading}
                    >
                        Add Participants
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddParticipantsDialog; 