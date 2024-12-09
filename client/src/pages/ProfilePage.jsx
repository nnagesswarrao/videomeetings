import React, { useState } from 'react';
import { 
    Box, 
    VStack, 
    Heading, 
    FormControl, 
    FormLabel, 
    Input, 
    Button, 
    Avatar, 
    Text 
} from '@chakra-ui/react';

const ProfilePage = () => {
    const [profile, setProfile] = useState({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        department: 'Engineering',
        jobTitle: 'Software Developer'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        console.log('Profile updated', profile);
        // Implement actual profile update logic
    };

    return (
        <Box maxWidth="600px" margin="auto">
            <VStack spacing={6} align="stretch">
                <Box textAlign="center">
                    <Avatar 
                        size="2xl" 
                        name={`${profile.firstName} ${profile.lastName}`} 
                        mb={4}
                    />
                    <Heading>{`${profile.firstName} ${profile.lastName}`}</Heading>
                    <Text color="gray.500">{profile.jobTitle}</Text>
                </Box>

                <VStack spacing={4} as="form">
                    <FormControl>
                        <FormLabel>First Name</FormLabel>
                        <Input 
                            name="firstName"
                            value={profile.firstName}
                            onChange={handleChange}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Last Name</FormLabel>
                        <Input 
                            name="lastName"
                            value={profile.lastName}
                            onChange={handleChange}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input 
                            type="email"
                            name="email"
                            value={profile.email}
                            onChange={handleChange}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Department</FormLabel>
                        <Input 
                            name="department"
                            value={profile.department}
                            onChange={handleChange}
                        />
                    </FormControl>
                    <FormControl>
                        <FormLabel>Job Title</FormLabel>
                        <Input 
                            name="jobTitle"
                            value={profile.jobTitle}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <Button 
                        colorScheme="blue" 
                        width="full"
                        onClick={handleSave}
                    >
                        Save Profile
                    </Button>
                </VStack>
            </VStack>
        </Box>
    );
};

export default ProfilePage;
