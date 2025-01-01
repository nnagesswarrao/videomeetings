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
    Select,
    Input,
    FormControl,
    FormLabel,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdVideoCall, MdEvent, MdUpcoming, MdCheck, MdDelete, MdVisibility, MdPersonAdd } from 'react-icons/md';
import CreateMeeting from './CreateMeeting';
import { formatDateTime, parseDateTime } from '../utils/dateUtils';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Calendar from './Calendar/Calendar';
import ViewMeeting from './ViewMeeting';
import Calls from './Calls/Calls';
import JoinMeeting from './JoinMeeting';
import AddParticipantsDialog from './AddParticipantsDialog';

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
    const [dateFilter, setDateFilter] = useState({
        startDate: null,
        endDate: null
    });
    const [filterType, setFilterType] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const { 
        isOpen: isViewOpen, 
        onOpen: onViewOpen, 
        onClose: onViewClose 
    } = useDisclosure();
    const [isAddParticipantsOpen, setIsAddParticipantsOpen] = useState(false);
    const [selectedMeetingForParticipants, setSelectedMeetingForParticipants] = useState(null);

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
        setSelectedMeeting(meeting);
        onViewOpen();
    };

    const handleAddParticipants = (meeting) => {
        setSelectedMeetingForParticipants(meeting);
        setIsAddParticipantsOpen(true);
    };

    const handleParticipantsAdded = () => {
        fetchMeetings(); // Refresh the meetings list
    };

    const getFilteredMeetings = (meetings, type, filterType, dateFilter) => {
        const now = new Date();
        let filteredByStatus = type === 'upcoming' 
            ? meetings.filter(meeting => new Date(meeting.start_time) > now)
            : meetings.filter(meeting => new Date(meeting.end_time) < now);

        // Apply date filter
        switch (filterType) {
            case 'today':
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                return filteredByStatus.filter(meeting => 
                    new Date(meeting.start_time) >= today && 
                    new Date(meeting.start_time) < tomorrow
                );

            case 'week':
                const weekStart = new Date();
                weekStart.setDate(weekStart.getDate() - weekStart.getDay());
                weekStart.setHours(0, 0, 0, 0);
                const weekEnd = new Date(weekStart);
                weekEnd.setDate(weekEnd.getDate() + 7);
                return filteredByStatus.filter(meeting => 
                    new Date(meeting.start_time) >= weekStart && 
                    new Date(meeting.start_time) < weekEnd
                );

            case 'month':
                const monthStart = new Date();
                monthStart.setDate(1);
                monthStart.setHours(0, 0, 0, 0);
                const monthEnd = new Date(monthStart);
                monthEnd.setMonth(monthEnd.getMonth() + 1);
                return filteredByStatus.filter(meeting => 
                    new Date(meeting.start_time) >= monthStart && 
                    new Date(meeting.start_time) < monthEnd
                );

            case 'custom':
                if (dateFilter.startDate && dateFilter.endDate) {
                    return filteredByStatus.filter(meeting => 
                        new Date(meeting.start_time) >= dateFilter.startDate && 
                        new Date(meeting.start_time) <= dateFilter.endDate
                    );
                }
                return filteredByStatus;

            default:
                return filteredByStatus;
        }
    };

    const renderMeetingGrid = (meetings, type) => {
        const filteredMeetings = getFilteredMeetings(meetings, type, filterType, dateFilter);
        const now = new Date();

        return (
            <Box>
                {/* Date Filter Controls */}
                <Box mb={4} p={4} bg="gray.50" borderRadius="md">
                    <HStack spacing={4} align="flex-end">
                        <FormControl w="200px">
                            <FormLabel>Filter by</FormLabel>
                            <Select 
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.target.value);
                                    if (e.target.value !== 'custom') {
                                        setDateFilter({ startDate: null, endDate: null });
                                    }
                                }}
                            >
                                <option value="all">All Meetings</option>
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="month">This Month</option>
                                <option value="custom">Custom Range</option>
                            </Select>
                        </FormControl>

                        {filterType === 'custom' && (
                            <>
                                <FormControl w="200px">
                                    <FormLabel>Start Date</FormLabel>
                                    <DatePicker
                                        selected={dateFilter.startDate}
                                        onChange={date => setDateFilter(prev => ({ 
                                            ...prev, 
                                            startDate: date 
                                        }))}
                                        dateFormat="yyyy-MM-dd"
                                        customInput={
                                            <Input />
                                        }
                                    />
                                </FormControl>

                                <FormControl w="200px">
                                    <FormLabel>End Date</FormLabel>
                                    <DatePicker
                                        selected={dateFilter.endDate}
                                        onChange={date => setDateFilter(prev => ({ 
                                            ...prev, 
                                            endDate: date 
                                        }))}
                                        dateFormat="yyyy-MM-dd"
                                        minDate={dateFilter.startDate}
                                        customInput={
                                            <Input />
                                        }
                                    />
                                </FormControl>

                                <Button
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => setDateFilter({ startDate: null, endDate: null })}
                                >
                                    Clear Dates
                                </Button>
                            </>
                        )}
                    </HStack>
                </Box>

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
                                                <>
                                                    <Button
                                                        leftIcon={<MdVideoCall />}
                                                        colorScheme="blue"
                                                        size="sm"
                                                        onClick={() => handleJoinMeeting(meeting.id)}
                                                        title="Join Meeting"
                                                    >
                                                        Join
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
                                                </>
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

    const handleCalendarEventSelect = (event) => {
        const meeting = event.resource;
        // if (new Date(meeting.start_time) > new Date()) {
        //     handleJoinMeeting(meeting.id);
        // } else {
            handleViewMeeting(meeting);
        // }
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

            {/* View Meeting Drawer */}
            <Drawer
                isOpen={isViewOpen}
                placement="right"
                onClose={onViewClose}
                size="md"
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth="1px">
                        Meeting Details
                    </DrawerHeader>

                    <DrawerBody p={0}>
                        {selectedMeeting && (
                            <ViewMeeting 
                                meeting={selectedMeeting}
                                onClose={onViewClose}
                            />
                        )}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>

            {/* Add Participants Dialog */}
            <AddParticipantsDialog
                isOpen={isAddParticipantsOpen}
                onClose={() => {
                    setIsAddParticipantsOpen(false);
                    setSelectedMeetingForParticipants(null);
                }}
                meetingId={selectedMeetingForParticipants?.id}
                onParticipantsAdded={handleParticipantsAdded}
            />

            {/* Update the Tabs section */}
            <Tabs>
                <TabList>
                    <Tab>Calendar View</Tab>
                    <Tab>Grid View</Tab>
                </TabList>

                <TabPanels>
                    {/* Calendar View */}
                    <TabPanel p={0} pt={4}>
                        <Box height="600px">
                            <Calendar 
                                meetings={meetings}
                                onSelectEvent={handleCalendarEventSelect}
                            />
                        </Box>
                    </TabPanel>

                    {/* Grid View */}
                    <TabPanel p={0} pt={4}>
                        <Tabs>
                            <TabList>
                                <Tab>Upcoming Meetings</Tab>
                                <Tab>Completed Meetings</Tab>
                                <Tab>Calls</Tab>
                                <Tab>Join Meeting</Tab>
                            </TabList>

                            <TabPanels>
                                {/* Upcoming Meetings Tab */}
                                <TabPanel p={0} pt={4}>
                                    {renderMeetingGrid(meetings, 'upcoming')}
                                </TabPanel>

                                {/* Completed Meetings Tab */}
                                <TabPanel p={0} pt={4}>
                                    {renderMeetingGrid(meetings, 'completed')}
                                </TabPanel>

                                {/* Calls Tab */}
                                <TabPanel p={0} pt={4}>
                                    <Calls />
                                </TabPanel>

                                {/* Join Meeting Tab */}
                                <TabPanel p={0} pt={4}>
                                    <JoinMeeting />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
  );
};

export default Dashboard;
