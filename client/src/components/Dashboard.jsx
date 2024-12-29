import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Stat,
    StatLabel,
    StatNumber,
    StatGroup,
    Heading,
    Button,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td,
    Badge,
    HStack,
    VStack,
    useToast,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    Card,
    CardBody,
    Icon,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    IconButton,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdVideoCall, MdEvent, MdUpcoming, MdCheck, MdDelete, MdVisibility, MdPersonAdd } from 'react-icons/md';
import CreateMeeting from './CreateMeeting';
import { formatDateTime, parseDateTime } from '../utils/dateUtils';

const Dashboard = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [meetings, setMeetings] = useState([]);
    const [stats, setStats] = useState({
        todayMeetings: 0,
        upcomingMeetings: 0,
        completedMeetings: 0
    });
    const { isOpen, onOpen, onClose } = useDisclosure();

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await fetch('http://localhost:5001/api/meetings/all');
            const data = await response.json();
            
            // Process meetings data
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            const processedMeetings = data.map(meeting => ({
                ...meeting,
                start_time: parseDateTime(meeting.start_time),
                end_time: parseDateTime(meeting.end_time)
            }));

            // Calculate stats
            const todayMeetings = processedMeetings.filter(meeting => 
                meeting.start_time >= today && 
                meeting.start_time < new Date(today.getTime() + 24 * 60 * 60 * 1000)
            ).length;

            const upcomingMeetings = processedMeetings.filter(meeting => 
                meeting.start_time > now
            ).length;

            const completedMeetings = processedMeetings.filter(meeting => 
                meeting.end_time < now
            ).length;

            setStats({
                todayMeetings,
                upcomingMeetings,
                completedMeetings
            });

            setMeetings(processedMeetings);
        } catch (error) {
            toast({
                title: 'Error fetching meetings',
                status: 'error',
                duration: 3000
            });
        }
    };

    const handleJoinMeeting = (meetingId) => {
        navigate(`/meeting/${meetingId}`);
    };

    const handleDeleteMeeting = async (meetingId) => {
        if (window.confirm('Are you sure you want to delete this meeting?')) {
            try {
                const response = await fetch(`http://localhost:5001/api/meetings/${meetingId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    toast({
                        title: "Success",
                        description: "Meeting deleted successfully",
                        status: "success",
                        duration: 3000,
                        isClosable: true,
                    });
                    fetchMeetings(); // Refresh the meetings list
                } else {
                    throw new Error('Failed to delete meeting');
                }
            } catch (error) {
                toast({
                    title: "Error",
                    description: "Failed to delete meeting",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };

    const handleViewMeeting = (meeting) => {
        // You can either navigate to a new page or open a drawer
        navigate(`/meeting/view/${meeting.id}`);
    };

    const handleAddParticipants = (meeting) => {
        navigate(`/meeting/participants/${meeting.id}`);
    };

    const renderMeetingGrid = (meetings, type) => {
        const now = new Date();
        const filteredMeetings = type === 'upcoming' 
            ? meetings.filter(meeting => new Date(meeting.start_time) > now)
            : meetings.filter(meeting => new Date(meeting.end_time) < now);

        return (
            <Box overflowX="auto">
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Title</Th>
                            <Th>Date & Time</Th>
                            <Th>Duration</Th>
                            <Th>Attendees</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {filteredMeetings.map(meeting => (
                            <Tr key={meeting.id}>
                                <Td fontWeight="medium">{meeting.title}</Td>
                                <Td>
                                    {formatDateTime(meeting.start_time)}
                                </Td>
                                <Td>{meeting.duration} mins</Td>
                                <Td>{meeting.required_attendees?.length || 0} required<br />
                                    {meeting.optional_attendees?.length || 0} optional</Td>
                                <Td>
                                    <Badge 
                                        colorScheme={
                                            meeting.start_time > now 
                                                ? 'blue' 
                                                : meeting.end_time < now 
                                                    ? 'gray' 
                                                    : 'green'
                                        }
                                    >
                                        {meeting.start_time > now 
                                            ? 'Upcoming' 
                                            : meeting.end_time < now 
                                                ? 'Completed' 
                                                : 'In Progress'}
                                    </Badge>
                                </Td>
                                <Td>
                                    <HStack spacing={2}>
                                        {type === 'upcoming' && (
                                            <Button
                                                leftIcon={<MdVideoCall />}
                                                colorScheme="blue"
                                                size="sm"
                                                onClick={() => handleJoinMeeting(meeting.id)}
                                                title="Join Meeting"
                                            >
                                                Join
                                            </Button>
                                        )}
                                        <Button
                                            leftIcon={<MdVisibility />}
                                            colorScheme="gray"
                                            size="sm"
                                            onClick={() => handleViewMeeting(meeting)}
                                            title="View Details"
                                        >
                                            View
                                        </Button>
                                        <Button
                                            leftIcon={<MdPersonAdd />}
                                            colorScheme="green"
                                            size="sm"
                                            onClick={() => handleAddParticipants(meeting)}
                                            title="Add Participants"
                                        >
                                            Add
                                        </Button>
                                        <Button
                                            leftIcon={<MdDelete />}
                                            colorScheme="red"
                                            size="sm"
                                            onClick={() => handleDeleteMeeting(meeting.id)}
                                            title="Delete Meeting"
                                        >
                                            Delete
                                        </Button>
                                    </HStack>
                                </Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
                {filteredMeetings.length === 0 && (
                    <Box textAlign="center" py={8} color="gray.500">
                        No {type} meetings found
                    </Box>
                )}
            </Box>
        );
    };

    const handleMeetingCreated = () => {
        onClose();
        fetchMeetings();
        toast({
            title: "Meeting Created",
            description: "Your meeting has been scheduled successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    return (
        <Box p={6}>
            {/* Stats Cards */}
            <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={6} mb={8}>
                <Card>
                    <CardBody>
                        <Stat>
                            <HStack spacing={4}>
                                <Icon as={MdEvent} boxSize={8} color="blue.500" />
                                <Box>
                                    <StatLabel fontSize="lg">Today's Meetings</StatLabel>
                                    <StatNumber>{stats.todayMeetings}</StatNumber>
                                </Box>
                            </HStack>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <HStack spacing={4}>
                                <Icon as={MdUpcoming} boxSize={8} color="green.500" />
                                <Box>
                                    <StatLabel fontSize="lg">Upcoming Meetings</StatLabel>
                                    <StatNumber>{stats.upcomingMeetings}</StatNumber>
                                </Box>
                            </HStack>
                        </Stat>
                    </CardBody>
                </Card>

                <Card>
                    <CardBody>
                        <Stat>
                            <HStack spacing={4}>
                                <Icon as={MdCheck} boxSize={8} color="gray.500" />
                                <Box>
                                    <StatLabel fontSize="lg">Completed Meetings</StatLabel>
                                    <StatNumber>{stats.completedMeetings}</StatNumber>
                                </Box>
                            </HStack>
                        </Stat>
                    </CardBody>
                </Card>
            </Grid>

            {/* Add Meeting Button */}
            <HStack justify="space-between" mb={6}>
                <Heading size="lg">Meetings</Heading>
                <Button
                    leftIcon={<MdAdd />}
                    colorScheme="blue"
                    onClick={onOpen}
                >
                    Add Meeting
                </Button>
            </HStack>

            {/* Create Meeting Drawer */}
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                size="lg"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">
                        Create New Meeting
                    </DrawerHeader>

                    <DrawerBody>
                        <CreateMeeting 
                            isDrawer={true}
                            onSuccess={handleMeetingCreated}
                            onCancel={onClose}
                        />
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* Meeting Grids */}
            <Tabs>
                <TabList>
                    <Tab>Upcoming Meetings</Tab>
                    <Tab>Completed Meetings</Tab>
                </TabList>

                <TabPanels>
                    <TabPanel p={0} pt={4}>
                        {renderMeetingGrid(meetings, 'upcoming')}
                    </TabPanel>
                    <TabPanel p={0} pt={4}>
                        {renderMeetingGrid(meetings, 'completed')}
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default Dashboard;
