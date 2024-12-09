import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../App';
import api from '../utils/api';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const toast = useToast();
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!email || !password) {
            toast({
                title: "Login Error",
                description: "Please enter both email and password",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            // Use custom api utility for login
            const response = await api.post('/users/login', { 
                email, 
                password 
            });

            // Store user data and login
            login({
                id: response.data.user.id,
                name: response.data.user.name,
                email: response.data.user.email,
                avatar: response.data.user.avatar || 'https://bit.ly/dan-abramov'
            });

            toast({
                title: "Login Successful",
                description: "Welcome back!",
                status: "success",
                duration: 2000,
                isClosable: true,
            });

            // Redirect to dashboard
            navigate('/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            
            // More detailed error handling
            if (error.response) {
                // The request was made and the server responded with a status code
                toast({
                    title: "Login Failed",
                    description: error.response.data.message || "Invalid credentials",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else if (error.request) {
                // The request was made but no response was received
                toast({
                    title: "Network Error",
                    description: "No response from server. Please check your connection.",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            } else {
                // Something happened in setting up the request
                toast({
                    title: "Error",
                    description: "An unexpected error occurred",
                    status: "error",
                    duration: 3000,
                    isClosable: true,
                });
            }
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
                        Teams Meeting
                    </Text>

                    <form onSubmit={handleLogin}>
                        <VStack spacing={4}>
                            <FormControl id="email" isRequired>
                                <FormLabel>Email</FormLabel>
                                <Input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                />
                            </FormControl>

                            <FormControl id="password" isRequired>
                                <FormLabel>Password</FormLabel>
                                <Input 
                                    type="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                />
                            </FormControl>

                            <Button 
                                type="submit" 
                                colorScheme="blue" 
                                width="full"
                                mt={4}
                            >
                                Login
                            </Button>
                        </VStack>
                    </form>

                    <Text textAlign="center" mt={4}>
                        Don't have an account? {' '}
                        <Link 
                            as={RouterLink} 
                            to="/register" 
                            color="blue.500"
                        >
                            Register
                        </Link>
                    </Text>
                </VStack>
            </Box>
        </Flex>
    );
};

export default LoginPage;
