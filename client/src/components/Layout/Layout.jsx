import React from 'react';
import { 
    Box, 
    Flex, 
    Container 
} from '@chakra-ui/react';
import Header from '../Header/Header';
import SideNav from '../SideNav';
import Footer from './Footer';
import { useSidebar } from '../../context/SidebarContext';

const Layout = ({ children, user }) => {
    const { isExpanded } = useSidebar();

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
                <SideNav />
                
                <Box 
                    className="main-content"
                    ml={isExpanded ? "70px" : "280px"}
                    mt="4rem"
                    flex={1} 
                    p={6} 
                    bg="gray.50"
                    transition="all 0.3s ease"
                >
                    <Container maxW="container.xl">
                        {children}
                    </Container>
                </Box>
            </Flex>
            
            <Footer />
        </Flex>
    );
};

export default Layout;
