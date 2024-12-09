import React from 'react';
import { 
    Box, 
    Flex, 
    Container 
} from '@chakra-ui/react';
import Header from '../Header/Header';
import SideNav from '../SideNav';
import Footer from './Footer';

const Layout = ({ children, user }) => {
    return (
        <Flex 
            direction="column" 
            minHeight="100vh"
        >
            <Header 
                title="Teams Meeting" 
                user={user || {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    avatar: 'https://bit.ly/dan-abramov'
                }}
            />
            
            <Flex flex={1}>
                {/* Side Navigation */}
                <SideNav />
                
                {/* Main Content Area */}
                <Box 
                    className="main-content"
                    ml="280px"  // Match SideNav expanded width 
                    mt="4rem"   // Account for header height
                    flex={1} 
                    p={6} 
                    bg="gray.50"
                >
                    <Container maxW="container.xl">
                        {children}
                    </Container>
                </Box>
            </Flex>
            
            {/* Footer */}
            <Footer />
        </Flex>
    );
};

export default Layout;
