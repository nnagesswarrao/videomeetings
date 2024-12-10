import React, { useState } from 'react';
import { 
    Box, 
    Button, 
    FormControl, 
    FormLabel, 
    Input, 
    VStack, 
    Text, 
    Link,
    Flex,
    useColorModeValue,
    useToast
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const SignupPage = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const toast = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            toast({
                title: "Signup Error",
                description: "Please fill in all required fields",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        // Password validation
        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Password Mismatch",
                description: "Passwords do not match",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await api.post('/users/signup', {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password
            });

            // Handle successful signup
            toast({
                title: "Signup Successful",
                description: "Your account has been created",
                status: "success",
                duration: 2000,
                isClosable: true,
            });

            // Redirect to login page
            navigate('/login');

        } catch (error) {
            console.error('Signup error:', error);
            
            // Handle signup errors
            const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
            
            toast({
                title: "Signup Error",
                description: errorMessage,
                status: "error",
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const bgColor = useColorModeValue('gray.50', 'gray.800');
    const formBgColor = useColorModeValue('white', 'gray.700');

    return (
        <Flex 
            align="center" 
            justify="center" 
            height="100vh" 
            bg={bgColor}
        >
            <Box 
                width="100%" 
                maxWidth="400px" 
                p={8} 
                borderRadius="lg" 
                boxShadow="lg"
                bg={formBgColor}
            >
                <VStack spacing={6} align="stretch">
                    <Text 
                        fontSize="3xl" 
                        fontWeight="bold" 
                        textAlign="center" 
                        mb={4}
                    >
                        Create Account
                    </Text>

                    <form onSubmit={handleSubmit}>
                        <VStack spacing={4}>
                            <FormControl id="firstName" isRequired>
                                <FormLabel>First Name</FormLabel>
                                <Input 
                                    type="text" 
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    placeholder="Enter your first name"
                                    autoComplete="given-name"
                                />
                            </FormControl>

                            <FormControl id="lastName" isRequired>
                                <FormLabel>Last Name</FormLabel>
                                <Input 
                                    type="text" 
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    placeholder="Enter your last name"
                                    autoComplete="family-name"
                                />
                            </FormControl>

                            <FormControl id="email" isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input 
                                    type="email" 
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                />
                            </FormControl>

                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input 
                                    type="password" 
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                />
                            </FormControl>

                            <FormControl id="confirmPassword" isRequired>
                                <FormLabel>Confirm Password</FormLabel>
                                <Input 
                                    type="password" 
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                />
                            </FormControl>

                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                width="full"
                                mt={4}
                            >
                                Sign Up
                            </Button>
                        </VStack>
                    </form>

                    <Text textAlign="center" mt={4}>
                        Already have an account? {' '}
                        <Link 
                            as={RouterLink} 
                            to="/login" 
                            color="blue.500"
                        >
                            Login
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
};

export default SignupPage;
