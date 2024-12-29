import React, { useState } from 'react';
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
    GridItem
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

// Custom styles for DatePicker
const datePickerStyles = {
    input: {
        border: '1px solid #E2E8F0',
        borderRadius: '0.375rem',
        padding: '0.5rem',
        width: '100%'
    }
};

const CreateMeeting = () => {
    const navigate = useNavigate();
    const toast = useToast();

    const [formData, setFormData] = useState({
        title: '',
        required_attendees: '',
        optional_attendees: '',
        start_time: new Date(),
        end_time: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
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
            const response = await fetch('http://localhost:5001/api/meetings/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                toast({
                    title: "Meeting Created",
                    description: "Your meeting has been scheduled",
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                });
                // navigate(`/meeting/${data.meeting.id}`);
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
        <Container maxW="container.xl" p={4}>
            <Tabs>
                <TabList mb={4}>
                    <Tab>Details</Tab>
                    <Tab>Scheduling Assistant</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel p={0}>
                        <form onSubmit={handleSubmit}>
                            <Grid templateColumns="3fr 1fr" gap={6}>
                                {/* Main Form Content */}
                                <GridItem>
                                    <VStack spacing={6} align="stretch">
                                        {/* Header */}
                                        <Flex justify="space-between" mb={4}>
                                            <Text fontSize="xl" fontWeight="bold">New meeting</Text>
                                            <HStack spacing={3}>
                                                <Button colorScheme="blue" type="submit">Save</Button>
                                                <Button onClick={() => navigate(-1)}>Close</Button>
                                            </HStack>
                                        </Flex>

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
                                                    <Input
                                                        name="required_attendees"
                                                        placeholder="Add required attendees"
                                                        value={formData.required_attendees}
                                                        onChange={handleInputChange}
                                                    />
                                                    <Input
                                                        name="optional_attendees"
                                                        placeholder="Add optional attendees"
                                                        value={formData.optional_attendees}
                                                        onChange={handleInputChange}
                                                    />
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
                                                            selected={formData.start_time}
                                                            onChange={date => setFormData(prev => ({ ...prev, start_time: date }))}
                                                            showTimeSelect
                                                            dateFormat="MMMM d, yyyy h:mm aa"
                                                            customInput={
                                                                <Input sx={datePickerStyles.input} />
                                                            }
                                                        />
                                                    </Box>
                                                    <Text>to</Text>
                                                    <Box flex={1}>
                                                        <DatePicker
                                                            selected={formData.end_time}
                                                            onChange={date => setFormData(prev => ({ ...prev, end_time: date }))}
                                                            showTimeSelect
                                                            dateFormat="MMMM d, yyyy h:mm aa"
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
                                    </VStack>
                                </GridItem>

                                {/* Right Sidebar */}
                                <GridItem>
                                    <VStack spacing={6} align="stretch" p={4} bg="gray.50" borderRadius="md">
                                        <Box>
                                            <Text fontWeight="bold" mb={2}>Show as</Text>
                                            <Select
                                                name="show_as"
                                                value={formData.show_as}
                                                onChange={handleInputChange}
                                                bg="white"
                                            >
                                                <option value="busy">Busy</option>
                                                <option value="free">Free</option>
                                                <option value="tentative">Tentative</option>
                                                <option value="away">Away</option>
                                            </Select>
                                        </Box>

                                        <Box>
                                            <Text fontWeight="bold" mb={2}>Response options</Text>
                                            <HStack>
                                                <Switch
                                                    name="registration_required"
                                                    isChecked={formData.registration_required}
                                                    onChange={handleInputChange}
                                                />
                                                <Text>Require registration</Text>
                                            </HStack>
                                        </Box>

                                        <Box>
                                            <Text fontWeight="bold" mb={2}>Meeting options</Text>
                                            <HStack>
                                                <Switch
                                                    name="record_meeting"
                                                    isChecked={formData.record_meeting}
                                                    onChange={handleInputChange}
                                                />
                                                <Text>Record automatically</Text>
                                            </HStack>
                                        </Box>
                                    </VStack>
                                </GridItem>
                            </Grid>
                        </form>
                    </TabPanel>

                    <TabPanel>
                        <Text>Scheduling Assistant Content</Text>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Container>
    );
};

export default CreateMeeting;
