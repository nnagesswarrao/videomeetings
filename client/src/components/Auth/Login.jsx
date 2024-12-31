import React, { useState } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Input, 
  Button, 
  useColorMode,
  useToast 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { login } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      // Add your login logic here
      login({ name: 'User', email: 'user@example.com' });
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to login. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box 
      minH="100vh" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
    >
      <VStack 
        spacing={6} 
        p={8} 
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        borderRadius="lg"
        boxShadow="lg"
        width="100%"
        maxW="400px"
      >
        <Heading>Login</Heading>
        <Input placeholder="Username" />
        <Input type="password" placeholder="Password" />
        <Button 
          colorScheme="blue" 
          width="100%" 
          onClick={handleLogin}
          isLoading={isLoading}
        >
          Login
        </Button>
      </VStack>
    </Box>
  );
};

export default Login;
