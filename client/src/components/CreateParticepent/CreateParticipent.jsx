import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    FormControl,
    FormLabel,
    Input,
    Select,
    VStack,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    IconButton,
    HStack,
    useDisclosure
} from '@chakra-ui/react';
import {
    FaPlus,
    FaEdit,
    FaTrash,
    FaSearch
} from 'react-icons/fa';
import { GROUP_TYPES } from '../../constants/groupTypes';

const CreateParticipant = () => {
    const origin = 'http://localhost:5001/api/';
    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast();

    // States
    const [participants, setParticipants] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        dateOfBirth: '',
        groupType: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch participants on component mount
    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const response = await fetch(origin + 'participants/all');
            const data = await response.json();
            setParticipants(data);
        } catch (error) {
            toast({
                title: 'Error fetching participants',
                status: 'error',
                duration: 3000
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const url = isEditing
                ? origin + 'participants/update/' + editId
                : origin + 'participants/create';

            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                toast({
                    title: `Participant ${isEditing ? 'updated' : 'created'} successfully`,
                    status: 'success',
                    duration: 3000
                });

                fetchParticipants();
                resetForm();
                onClose();
            }
        } catch (error) {
            toast({
                title: 'Error saving participant',
                status: 'error',
                duration: 3000
            });
        }
    };

    const handleEdit = (participant) => {
        setFormData({
            name: participant.username,
            phoneNumber: participant.phone_number,
            email: participant.email,
            dateOfBirth: participant.date_of_birth.split('T')[0],
            groupType: participant.group_id
        });
        setEditId(participant.id);
        setIsEditing(true);
        onOpen();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this participant?')) {
            try {
                const response = await fetch(origin + 'participants/' + id, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    toast({
                        title: 'Participant deleted successfully',
                        status: 'success',
                        duration: 3000
                    });
                    fetchParticipants();
                }
            } catch (error) {
                toast({
                    title: 'Error deleting participant',
                    status: 'error',
                    duration: 3000
                });
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phoneNumber: '',
            email: '',
            dateOfBirth: '',
            groupType: ''
        });
        setIsEditing(false);
        setEditId(null);
    };

    const filteredParticipants = Array.isArray(participants)
        ? participants.filter(participant =>
            participant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            participant.email?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    return (
        <Box p={4}>
            {/* Header */}
            <HStack mb={4} justify="space-between">
                <Button
                    leftIcon={<FaPlus />}
                    colorScheme="blue"
                    onClick={() => {
                        resetForm();
                        onOpen();
                    }}
                >
                    Create Participant
                </Button>

                <Box>
                    <Input
                        placeholder="Search participants..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        width="300px"
                        leftIcon={<FaSearch />}
                    />
                </Box>
            </HStack>

            {/* Participants Grid */}
            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Name</Th>
                            <Th>Phone Number</Th>
                            <Th>Email</Th>
                            <Th>Date of Birth</Th>
                            <Th>Group</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredParticipants.map(participant => (
                            <Tr key={participant.id}>
                                <Td>{participant.username || ''}</Td>
                                <Td>{participant.phone_number || ''}</Td>
                                <Td>{participant.email || ''}</Td>
                                <Td>{participant.date_of_birth ? new Date(participant.date_of_birth).toLocaleDateString() : ''}</Td>
                                <Td>{participant.group_type || ''}</Td>
                                <Td>
                                    <HStack spacing={2}>
                                        <IconButton
                                            icon={<FaEdit />}
                                            onClick={() => handleEdit(participant)}
                                            colorScheme="blue"
                                            size="sm"
                                        />
                                        <IconButton
                                            icon={<FaTrash />}
                                            onClick={() => handleDelete(participant.id)}
                                            colorScheme="red"
                                            size="sm"
                                        />
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {/* Create/Edit Drawer */}
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                size="md"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader>
                        {isEditing ? 'Edit Participant' : 'Create Participant'}
                    </DrawerHeader>

                    <DrawerBody>
                        <form onSubmit={handleSubmit}>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Name</FormLabel>
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter name"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Phone Number</FormLabel>
                                    <Input
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email"
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Date of Birth</FormLabel>
                                    <Input
                                        name="dateOfBirth"
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                    />
                                </FormControl>

                                <FormControl isRequired>
                                    <FormLabel>Group</FormLabel>
                                    <Select
                                        name="groupType"
                                        value={formData.groupType}
                                        onChange={handleInputChange}
                                        placeholder="Select group"
                                    >
                                        {Object.values(GROUP_TYPES).map(group => (
                                            <option key={group.id} value={group.id}>
                                                {group.label}
                                            </option>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    width="full"
                                    mt={4}
                                >
                                    {isEditing ? 'Update' : 'Create'}
                                </Button>
                            </VStack>
                        </form>
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </Box>
    );
};

export default CreateParticipant;
