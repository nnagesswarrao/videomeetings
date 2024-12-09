import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    FormControl, 
    FormLabel, 
    Input, 
    VStack, 
    Heading, 
    Text, 
    Link as ChakraLink 
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            console.error('Passwords do not match');
            return;
        }
        console.log('Registration attempt', formData);
        // Implement actual registration logic
    };

    return (
        <Box 
            maxWidth="500px" 
            margin="auto" 
            mt={12} 
            p={6} 
            borderWidth={1} 
            borderRadius="lg"
        >
            <VStack spacing={6} align="stretch">
                <Heading textAlign="center">Create Account</Heading>
                <form onSubmit={handleRegister}>
                    <VStack spacing={4}>
                        <FormControl>
                            <FormLabel>First Name</FormLabel>
                            <Input 
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="Enter your first name"
                                required
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Last Name</FormLabel>
                            <Input 
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Enter your last name"
                                required
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Email</FormLabel>
                            <Input 
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                required
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Password</FormLabel>
                            <Input 
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create a password"
                                required
                            />
                        </FormControl>
                        <FormControl>
                            <FormLabel>Confirm Password</FormLabel>
                            <Input 
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm your password"
                                required
                            />
                        </FormControl>
                        <Button 
                            colorScheme="blue" 
                            type="submit" 
                            width="full"
                        >
                            Register
                        </Button>
                    </VStack>
                </form>
                <Text textAlign="center">
                    Already have an account? {' '}
                    <ChakraLink 
                        as={RouterLink} 
                        to="/login" 
                        color="blue.500"
                    >
                        Login
                    </ChakraLink>
                </Text>
            </VStack>
        </Box>
    );
};

export default RegisterPage;
