import React from 'react';
import { 
    Box, 
    VStack, 
    Text,
    useColorMode,
    Flex
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { useSidebar } from '../context/SidebarContext';

const SideNav = () => {
    const location = useLocation();
    const { isExpanded } = useSidebar();
    const { colorMode } = useColorMode();

    const menuItems = [
        { path: '/dashboard', icon: '📊', label: 'Dashboard' },
        { path: '/join-meeting', icon: '➡️', label: 'Join Meeting' },
        { path: '/profile', icon: '👤', label: 'Profile' },
        { path: '/create-participent', icon: '👤', label: 'Create Participant' },
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
            overflowX="hidden"
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

            <VStack spacing={0} align="stretch" mt={2}>
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{ textDecoration: 'none' }}
                        >
                            <Flex
                                align="center"
                                px={4}
                                py={3}
                                mx={2}
                                borderRadius="md"
                                cursor="pointer"
                                position="relative"
                                bg={isActive ? (colorMode === 'light' ? 'blue.50' : 'blue.900') : 'transparent'}
                                color={isActive 
                                    ? (colorMode === 'light' ? 'blue.600' : 'blue.200')
                                    : (colorMode === 'light' ? 'gray.700' : 'white')
                                }
                                _hover={{
                                    bg: colorMode === 'light' 
                                        ? (isActive ? 'blue.100' : 'gray.100')
                                        : (isActive ? 'blue.800' : 'whiteAlpha.200'),
                                    color: isActive 
                                        ? (colorMode === 'light' ? 'blue.700' : 'blue.100')
                                        : (colorMode === 'light' ? 'blue.600' : 'blue.200')
                                }}
                                transition="all 0.2s ease"
                            >
                                {/* Active indicator */}
                                {isActive && (
                                    <Box
                                        position="absolute"
                                        left={0}
                                        top="50%"
                                        transform="translateY(-50%)"
                                        w="4px"
                                        h="60%"
                                        bg={colorMode === 'light' ? 'blue.500' : 'blue.200'}
                                        borderRadius="full"
                                    />
                                )}
                                
                                {/* Icon */}
                                <Box
                                    fontSize="20px"
                                    width="24px"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                >
                                    {item.icon}
                                </Box>
                                
                                {/* Label */}
                                {!isExpanded && (
                                    <Text
                                        ml={3}
                                        fontSize="sm"
                                        fontWeight={isActive ? "600" : "normal"}
                                    >
                                        {item.label}
                                    </Text>
                                )}
                            </Flex>
                        </Link>
                    );
                })}
            </VStack>
        </Box>
    );
};

export default SideNav;
