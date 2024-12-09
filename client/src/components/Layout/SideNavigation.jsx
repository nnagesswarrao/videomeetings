import React from 'react';
import { 
    Box, 
    VStack, 
    Text, 
    Icon, 
    Flex 
} from '@chakra-ui/react';
import { 
    HamburgerIcon as HomeIcon, 
    ViewIcon as VideoIcon, 
    ChatIcon, 
    SettingsIcon, 
    AtSignIcon as ProfileIcon 
} from '@chakra-ui/icons';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { useColorMode } from '@chakra-ui/react';

const NavItem = ({ icon, label, to }) => {
    const location = useLocation();
    const { colorMode } = useColorMode();
    const isActive = location.pathname === to;

    // Predefined color values
    const colors = {
        light: {
            active: 'blue.600',
            inactive: 'gray.600',
            activeBg: 'blue.50',
            hoverBg: 'gray.100',
            hoverColor: 'blue.700'
        },
        dark: {
            active: 'blue.300',
            inactive: 'gray.300',
            activeBg: 'blue.900',
            hoverBg: 'gray.700',
            hoverColor: 'blue.200'
        }
    };

    const currentColors = colorMode === 'light' ? colors.light : colors.dark;

    return (
        <Flex 
            as={RouterLink} 
            to={to}
            align="center"
            px={4}
            py={2}
            borderRadius="md"
            color={isActive ? currentColors.active : currentColors.inactive}
            bg={isActive ? currentColors.activeBg : 'transparent'}
            _hover={{
                bg: currentColors.hoverBg,
                color: currentColors.hoverColor
            }}
            width="full"
        >
            <Icon as={icon} mr={3} />
            <Text fontWeight={isActive ? 'bold' : 'normal'}>{label}</Text>
        </Flex>
    );
};

const SideNavigation = () => {
    const { colorMode } = useColorMode();

    // Predefined background colors
    const bgColors = {
        light: 'white',
        dark: 'gray.800'
    };

    const borderColors = {
        light: 'gray.200',
        dark: 'gray.700'
    };

    const navItems = [
        { icon: HomeIcon, label: 'Home', to: '/' },
        { icon: VideoIcon, label: 'Meetings', to: '/meetings' },
        { icon: ChatIcon, label: 'Messages', to: '/messages' },
        { icon: ProfileIcon, label: 'Profile', to: '/profile' },
        { icon: SettingsIcon, label: 'Settings', to: '/settings' }
    ];

    return (
        <Box
            width="250px"
            height="100vh"
            position="fixed"
            left={0}
            top={0}
            pt="4rem"  // Account for header height
            bg={bgColors[colorMode]}
            borderRight="1px"
            borderColor={borderColors[colorMode]}
            boxShadow="md"
            zIndex="1000"
        >
            <VStack 
                spacing={2} 
                align="stretch" 
                px={2} 
                pt={4}
            >
                {navItems.map((item, index) => (
                    <NavItem 
                        key={index} 
                        icon={item.icon} 
                        label={item.label} 
                        to={item.to} 
                    />
                ))}
            </VStack>
        </Box>
    );
};

export default SideNavigation;
