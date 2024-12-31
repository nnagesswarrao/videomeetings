import React from 'react';
import { 
    Box, 
    VStack, 
    Text,
    useColorMode 
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';
import './SideNav.css';

const SideNav = () => {
    const location = useLocation();
    const { isExpanded } = useSidebar();
    const { colorMode } = useColorMode();

    const menuItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/join-meeting', icon: '➡️', label: 'Join Meeting' },
        { path: '/profile', icon: '👤', label: 'Profile' },
        { path: '/create-participent', icon: '👤', label: 'create-participent' },
    ];

    return (
        <Box
            position="fixed"
            left={0}
            top={0}
            bottom={0}
            w={isExpanded ? "70px" : "280px"}
            bg={colorMode === 'light' ? 'white' : 'gray.800'}
            boxShadow="0 4px 12px 0 rgba(0, 0, 0, 0.05)"
            transition="all 0.3s ease"
            zIndex={1100}
        >
            <Box
                h="70px"
                borderBottom="1px"
                borderColor={colorMode === 'light' ? 'gray.200' : 'whiteAlpha.200'}
                display="flex"
                alignItems="center"
                justifyContent={isExpanded ? "center" : "flex-start"}
                px={isExpanded ? 2 : 4}
            >
                <Text
                    fontSize="xl"
                    fontWeight="bold"
                    color={colorMode === 'light' ? 'gray.700' : 'white'}
                    transition="opacity 0.3s ease"
                >
                    {isExpanded ? 'VM' : 'Video Meeting'}
                </Text>
            </Box>

            <VStack spacing={1} align="stretch">
                {menuItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            px={4}
                            py={3}
                            color={colorMode === 'light' ? 'gray.700' : 'white'}
                            _hover={{
                                bg: colorMode === 'light' ? 'gray.100' : 'whiteAlpha.200'
                            }}
                        >
                            <span className="icon">{item.icon}</span>
                            {!isExpanded && <span className="label">{item.label}</span>}
                        </Box>
                    </Link>
                ))}
            </VStack>
        </Box>
    );
};

export default SideNav;
