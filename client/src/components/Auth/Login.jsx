import React, { useState } from 'react';
import { 
  Box, 
  Container,
  VStack, 
  Heading, 
  Input, 
  Button, 
  Text,
  useColorMode,
  useToast,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Divider,
  HStack,
  Link,
  FormControl,
  FormLabel,
  FormErrorMessage
} from '@chakra-ui/react';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaGoogle 
} from 'react-icons/fa';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { colorMode } = useColorMode();
  const { login } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Implement Google login logic here
      toast({
        title: 'Google Login',
        description: 'Google login functionality will be implemented',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      bg={colorMode === 'light' ? 'gray.50' : 'gray.900'}
      py={12}
      px={4}
    >
      <Container
        maxW="md"
        bg={colorMode === 'light' ? 'white' : 'gray.800'}
        borderRadius="xl"
        boxShadow="xl"
        p={8}
      >
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <VStack spacing={2} align="center">
            <Heading size="xl" color={colorMode === 'light' ? 'blue.600' : 'blue.300'}>
              Welcome Back
            </Heading>
            <Text color="gray.500">
              Sign in to continue to your account
            </Text>
          </VStack>

          {/* Google Login Button */}
          <Button
            leftIcon={<FaGoogle />}
            onClick={handleGoogleLogin}
            size="lg"
            variant="outline"
            colorScheme="red"
            w="full"
          >
            Continue with Google
          </Button>

          <HStack>
            <Divider />
            <Text fontSize="sm" whiteSpace="nowrap" color="gray.500">
              or sign in with email
            </Text>
            <Divider />
          </HStack>

          {/* Login Form */}
          <VStack spacing={4}>
            <FormControl isInvalid={errors.email}>
              <FormLabel>Email</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaEnvelope color="gray.300" />
                </InputLeftElement>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </InputGroup>
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={errors.password}>
              <FormLabel>Password</FormLabel>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <FaLock color="gray.300" />
                </InputLeftElement>
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                />
                <InputRightElement>
                  <IconButton
                    icon={showPassword ? <FaEyeSlash /> : <FaEye />}
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>
          </VStack>

          {/* Forgot Password Link */}
          <Box alignSelf="flex-end">
            <Link
              as={RouterLink}
              to="/forgot-password"
              color="blue.500"
              fontSize="sm"
              _hover={{ textDecoration: 'underline' }}
            >
              Forgot Password?
            </Link>
          </Box>

          {/* Login Button */}
          <Button
            colorScheme="blue"
            size="lg"
            width="full"
            onClick={handleLogin}
            isLoading={isLoading}
            loadingText="Signing in..."
          >
            Sign In
          </Button>

          {/* Sign Up Link */}
          <Text textAlign="center">
            Don't have an account?{' '}
            <Link
              as={RouterLink}
              to="/register"
              color="blue.500"
              _hover={{ textDecoration: 'underline' }}
            >
              Sign up
            </Link>
          </Text>
        </VStack>
      </Container>
    </Box>
  );
};

export default Login;
