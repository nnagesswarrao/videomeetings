import React from 'react';
import { 
    Box, 
    Heading, 
    Text, 
    Button, 
    VStack 
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <Box 
            textAlign="center" 
            py={10} 
            px={6}
        >
            <VStack spacing={6}>
                <Heading 
                    display="flex" 
                    flexDirection="column" 
                    alignItems="center"
                    justifyContent="center"
                    size="4xl"
                    color="red.400"
                >
                    404
                    <Text 
                        fontSize="2xl" 
                        color="gray.500" 
                        mt={4}
                    >
                        Page Not Found
                    </Text>
                </Heading>
                
                <Text color="gray.500" fontSize="lg">
                    The page you're looking for does not seem to exist
                </Text>
                
                <Button 
                    as={RouterLink} 
                    to="/" 
                    colorScheme="blue"
                    size="lg"
                >
                    Go to Home
                </Button>
            </VStack>
        </Box>
    );
};

export default NotFoundPage;
