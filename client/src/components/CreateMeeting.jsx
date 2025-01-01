import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Input,
    Textarea,
    Button,
    Text,
    Flex,
    Switch,
    Select,
    IconButton,
    Tabs,
    TabList,
    Tab,
    TabPanels,
    TabPanel,
    useToast,
    Container,
    Grid,
    GridItem,
    List,
    ListItem,
    Tag,
    TagLabel,
    TagCloseButton,
    useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { 
    MdTitle, 
    MdGroup, 
    MdAccessTime, 
    MdRepeat, 
    MdLocationOn,
    MdDescription,
    MdAdd
} from 'react-icons/md';
import { SearchIcon } from '@chakra-ui/icons';
import { formatDateTime, parseDateTime } from '../utils/dateUtils';

// Custom styles for DatePicker
const datePickerStyles = {
    input: {
        border: '1px solid #E2E8F0',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        width: '100%'
    }
};

const CreateMeeting = ({ isDrawer = false, onSuccess, onCancel }) => {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState({
        title: '',
        required_attendees: [],
        start_time: formatDateTime(new Date()),
        end_time: formatDateTime(new Date(new Date().setMinutes(new Date().getMinutes() + 30))),
        recurrence: 'none',
        channel: '',
        location: '',
        description: '',
        is_online_meeting: true,
        show_as: 'busy',
        category: 'none',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        registration_required: false,
        record_meeting: true
    });

    const [participants, setParticipants] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchBgColor = useColorModeValue('white', 'gray.700');
    const searchHoverBgColor = useColorModeValue('gray.50', 'gray.600');

    useEffect(() => {
        fetchParticipants();
    }, []);

    const fetchParticipants = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/participants/all');
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

    const handleSearchChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        
        if (query.trim() === '') {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        const filtered = participants.filter(participant =>
            participant.username.toLowerCase().includes(query.toLowerCase()) &&
            !formData.required_attendees.some(a => a.id === participant.id)
        );
        
        setSearchResults(filtered);
        setShowSearchResults(true);
    };

    const addAttendee = (participant) => {
        setFormData(prev => ({
            ...prev,
            required_attendees: [...prev.required_attendees, participant]
        }));
        setSearchQuery('');
        setSearchResults([]);
        setShowSearchResults(false);
    };

    const removeAttendee = (participantId) => {
        setFormData(prev => ({
            ...prev,
            required_attendees: prev.required_attendees.filter(a => a.id !== participantId)
        }));
    };

    const AttendeeSearchInput = () => (
        <Box position="relative" width="full">
            <Input
                placeholder="Search and add attendees"
                value={searchQuery}
                onChange={handleSearchChange}
                pr="40px"
            />
            <SearchIcon
                position="absolute"
                right="14px"
                top="50%"
                transform="translateY(-50%)"
                color="gray.500"
            />
            
            {showSearchResults && searchResults.length > 0 && (
                <List
                    position="absolute"
                    zIndex={1000}
                    bg={searchBgColor}
                    width="100%"
                    borderRadius="md"
                    boxShadow="lg"
                    mt={1}
                    maxH="200px"
                    overflowY="auto"
                    border="1px solid"
                    borderColor="gray.200"
                >
                    {searchResults.map(participant => (
                        <ListItem
                            key={participant.id}
                            px={4}
                            py={2}
                            cursor="pointer"
                            _hover={{ bg: searchHoverBgColor }}
                            onClick={() => addAttendee(participant)}
                        >
                            <Text fontWeight="medium">{participant.username}</Text>
                            <Text fontSize="sm" color="gray.500">
                                {participant.email}
                            </Text>
                        </ListItem>
                    ))}
                </List>
            )}
        </Box>
    );

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' || type === 'switch' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const meetingData = {
                ...formData,
                required_attendees: formData.required_attendees.map(a => a.id),
            };
            
            const response = await fetch('http://localhost:5001/api/meetings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(meetingData)
            });

            const data = await response.json();

            if (response.ok) {
                if (onSuccess) {
                    onSuccess(data);
                } else {
                toast({
                    title: "Meeting Created",
                    description: "Your meeting has been scheduled",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                    navigate(`/dashboard`);
                }
            } else {
                toast({
                    title: "Error",
                    description: data.error || "Failed to create meeting",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Meeting creation error:', error);
            toast({
                title: "Error",
                description: "Network error occurred",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    return (
        <Container maxW={isDrawer ? "full" : "container.xl"} p={isDrawer ? 0 : 4}>
                        <form onSubmit={handleSubmit}>
                                    <VStack spacing={6} align="stretch">
                    {!isDrawer && (
                                        <Flex justify="space-between" mb={4}>
                                            <Text fontSize="xl" fontWeight="bold">New meeting</Text>
                                        </Flex>
                    )}

                                        {/* Title */}
                                        <Box borderBottom="1px" borderColor="gray.200" pb={4}>
                                            <HStack spacing={4}>
                                                <IconButton
                                                    aria-label="Title"
                                                    icon={<MdTitle />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <Input
                                                    name="title"
                                                    placeholder="Add title"
                                                    value={formData.title}
                                                    onChange={handleInputChange}
                                                    variant="unstyled"
                                                    fontSize="lg"
                                                />
                                            </HStack>
                                        </Box>

                                        {/* Attendees */}
                                        <Box>
                                            <HStack align="start" spacing={4}>
                                                <IconButton
                                                    aria-label="Attendees"
                                                    icon={<MdGroup />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <VStack align="stretch" width="full" spacing={3}>
                                <Box>
                                    <Text mb={2} fontWeight="medium">Attendees</Text>
                                    <AttendeeSearchInput />
                                    <Flex gap={2} mt={2} flexWrap="wrap">
                                        {formData.required_attendees?.map(attendee => (
                                            <Tag
                                                key={attendee.id}
                                                size="md"
                                                borderRadius="full"
                                                variant="solid"
                                                colorScheme="blue"
                                            >
                                                <TagLabel>{attendee.username}</TagLabel>
                                                <TagCloseButton
                                                    onClick={() => removeAttendee(attendee.id)}
                                                />
                                            </Tag>
                                        ))}
                                    </Flex>
                                </Box>
                                                </VStack>
                                            </HStack>
                                        </Box>

                                        {/* Date/Time */}
                                        <Box>
                                            <HStack align="center" spacing={4}>
                                                <IconButton
                                                    aria-label="Time"
                                                    icon={<MdAccessTime />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <Flex gap={4} align="center" flex={1}>
                                                    <Box flex={1}>
                                                        <DatePicker
                                        selected={parseDateTime(formData.start_time)}
                                        onChange={date => setFormData(prev => ({ 
                                            ...prev, 
                                            start_time: formatDateTime(date),
                                            end_time: formatDateTime(new Date(date.getTime() + 30 * 60000))
                                        }))}
                                                            showTimeSelect
                                        dateFormat="yyyy-MM-dd HH:mm"
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                                            customInput={
                                                                <Input sx={datePickerStyles.input} />
                                                            }
                                                        />
                                                    </Box>
                                                    <Text>to</Text>
                                                    <Box flex={1}>
                                                        <DatePicker
                                        selected={parseDateTime(formData.end_time)}
                                        onChange={date => setFormData(prev => ({ 
                                            ...prev, 
                                            end_time: formatDateTime(date)
                                        }))}
                                                            showTimeSelect
                                        dateFormat="yyyy-MM-dd HH:mm"
                                        timeFormat="HH:mm"
                                        timeIntervals={15}
                                        minDate={parseDateTime(formData.start_time)}
                                        minTime={parseDateTime(formData.start_time)}
                                        maxTime={new Date(new Date().setHours(23, 59))}
                                                            customInput={
                                                                <Input sx={datePickerStyles.input} />
                                                            }
                                                        />
                                                    </Box>
                                                </Flex>
                                            </HStack>
                                        </Box>

                                        {/* Recurrence */}
                                        <Box>
                                            <HStack spacing={4}>
                                                <IconButton
                                                    aria-label="Recurrence"
                                                    icon={<MdRepeat />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <Select
                                                    name="recurrence"
                                                    value={formData.recurrence}
                                                    onChange={handleInputChange}
                                                    width="200px"
                                                >
                                                    <option value="none">Does not repeat</option>
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                </Select>
                                            </HStack>
                                        </Box>

                                        {/* Channel */}
                                        <Box>
                                            <HStack spacing={4}>
                                                <IconButton
                                                    aria-label="Add channel"
                                                    icon={<MdAdd />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <Input
                                                    name="channel"
                                                    placeholder="Add channel"
                                                    value={formData.channel}
                                                    onChange={handleInputChange}
                                                />
                                            </HStack>
                                        </Box>

                                        {/* Location */}
                                        <Box>
                                            <HStack spacing={4}>
                                                <IconButton
                                                    aria-label="Location"
                                                    icon={<MdLocationOn />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <Input
                                                    name="location"
                                                    placeholder="Add location"
                                                    value={formData.location}
                                                    onChange={handleInputChange}
                                                />
                                                <Switch
                                                    name="is_online_meeting"
                                                    isChecked={formData.is_online_meeting}
                                                    onChange={handleInputChange}
                                                />
                                                <Text whiteSpace="nowrap">Online meeting</Text>
                                            </HStack>
                                        </Box>

                                        {/* Description */}
                                        <Box>
                                            <HStack align="start" spacing={4}>
                                                <IconButton
                                                    aria-label="Description"
                                                    icon={<MdDescription />}
                                                    variant="ghost"
                                                    size="sm"
                                                />
                                                <Textarea
                                                    name="description"
                                                    placeholder="Type details for this new meeting"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    minH="200px"
                                                    resize="vertical"
                                                />
                                            </HStack>
                                        </Box>

                    <HStack spacing={3} justify="flex-end">
                        {isDrawer && (
                            <Button onClick={onCancel}>
                                Cancel
                            </Button>
                        )}
                        <Button 
                            colorScheme="blue" 
                            type="submit"
                        >
                            Create Meeting
                        </Button>
                                            </HStack>
                                    </VStack>
                        </form>
        </Container>
    );
};

export default CreateMeeting;
