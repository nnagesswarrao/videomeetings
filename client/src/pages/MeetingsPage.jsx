import React from 'react';
import { 
    Box, 
    Heading, 
    VStack, 
    Text, 
    Button, 
    Grid, 
    GridItem 
} from '@chakra-ui/react';

const MeetingsPage = () => {
    const meetings = [
        { id: 1, title: 'Team Standup', time: '10:00 AM', participants: 5 },
        { id: 2, title: 'Client Meeting', time: '2:00 PM', participants: 3 },
        { id: 3, title: 'Project Review', time: '4:00 PM', participants: 7 }
    ];

    return (
        <Box>
            <Heading mb={6}>Upcoming Meetings</Heading>
            <Grid templateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={6}>
                {meetings.map(meeting => (
                    <GridItem 
                        key={meeting.id} 
                        borderWidth={1} 
                        borderRadius="lg" 
                        p={4}
                    >
                        <VStack align="stretch" spacing={3}>
                            <Heading size="md">{meeting.title}</Heading>
                            <Text>Time: {meeting.time}</Text>
                            <Text>Participants: {meeting.participants}</Text>
                            <Button colorScheme="blue">Join Meeting</Button>
                        </VStack>
                    </GridItem>
                ))}
            </Grid>
            <Box mt={8} textAlign="center">
                <Button colorScheme="green" size="lg">
                    Schedule New Meeting
                </Button>
            </Box>
        </Box>
    );
};

export default MeetingsPage;
