import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import Header from '../Header';

const Layout = ({ children, title = 'Teams Meeting' }) => {
    return (
        <VStack 
            spacing={0} 
            align="stretch" 
            width="full" 
            minHeight="100vh"
        >
            {/* Fixed Header */}
            <Header title={title} />

            {/* Main Content Area */}
            <Box 
                as="main" 
                flex="1" 
                mt="4rem"  // Account for fixed header height
                p={4}
            >
                {children}
            </Box>
        </VStack>
    );
};

export default Layout;
