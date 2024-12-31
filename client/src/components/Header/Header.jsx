import React from 'react';
import { 
    Box, 
    Flex, 
    Text, 
    Avatar, 
    Menu,
    MenuButton,
    MenuList,
    MenuItem,
    IconButton,
    Tooltip,
    useColorMode
} from '@chakra-ui/react';
import { 
    BellIcon, 
    MoonIcon, 
    SunIcon, 
    SettingsIcon, 
    ChatIcon,
    QuestionOutlineIcon,
    ArrowForwardIcon,
    HamburgerIcon,
    ChevronRightIcon
} from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import { useSidebar } from '../../context/SidebarContext';

const lightColors = {
    headerBg: 'white',
    headerShadow: 'md',
    textColor: 'blue.600',
    actionColor: 'gray.600',
    hoverBg: 'gray.100',
    hoverColor: 'blue.600'
};

const darkColors = {
    headerBg: 'gray.800',
    headerShadow: 'dark-lg',
    textColor: 'blue.300',
    actionColor: 'gray.300',
    hoverBg: 'gray.700',
    hoverColor: 'blue.300'
};

const Header = ({ 
    title = 'Teams Meeting', 
    user = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        avatar: 'https://bit.ly/dan-abramov'
    },
    onLogout
}) => {
    const { colorMode, toggleColorMode } = useColorMode();
    const navigate = useNavigate();
    const { isExpanded, toggleSidebar } = useSidebar();

    // Compute color values based on color mode
    const colors = colorMode === 'light' ? lightColors : darkColors;

    // Memoize header actions to prevent unnecessary re-renders
    const headerActions = React.useMemo(() => [
        { 
            icon: <ChatIcon />, 
            label: 'Messages',
            onClick: () => navigate('/chat')
        },
        { 
            icon: <BellIcon />, 
            label: 'Notifications',
            onClick: () => console.log('Open Notifications')
        },
        { 
            icon: colorMode === 'light' ? <MoonIcon /> : <SunIcon />, 
            label: `Switch to ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`,
            onClick: toggleColorMode
        }
    ], [colorMode, toggleColorMode, navigate]);

    return (
        <Flex
            as="header"
            align="center"
            justify="space-between"
            wrap="nowrap"
            padding="0.5rem 2rem"
            bg={colors.headerBg}
            boxShadow={colors.headerShadow}
            position="fixed"
            top="0"
            left={isExpanded ? "70px" : "280px"}
            right="0"
            zIndex="1000"
            transition="all 0.3s ease"
        >
            {/* Application Logo and Title */}
            <Flex align="center">
                <IconButton
                    icon={isExpanded ? <HamburgerIcon /> : <ChevronRightIcon />}
                    variant="ghost"
                    onClick={toggleSidebar}
                    aria-label="Toggle Navigation"
                    mr={4}
                    color={colors.actionColor}
                    _hover={{
                        bg: colors.hoverBg,
                        color: colors.hoverColor
                    }}
                />
                <Text 
                    fontSize="2xl" 
                    fontWeight="bold" 
                    color={colors.textColor}
                    mr={6}
                >
                    {title}
                </Text>
            </Flex>

            {/* Header Actions */}
            <Flex align="center">
                {headerActions.map((action, index) => (
                    <Tooltip 
                        key={index} 
                        label={action.label} 
                        aria-label={action.label}
                    >
                        <IconButton
                            icon={action.icon}
                            variant="ghost"
                            color={colors.actionColor}
                            mr={2}
                            onClick={action.onClick}
                            _hover={{
                                bg: colors.hoverBg,
                                color: colors.hoverColor
                            }}
                        />
                    </Tooltip>
                ))}

                {/* User Profile Menu */}
                <Menu>
                    <Tooltip label={user.name}>
                        <MenuButton 
                            as={Avatar}
                            size="sm"
                            name={user.name}
                            src={user.avatar}
                            cursor="pointer"
                            ml={2}
                        />
                    </Tooltip>
                    <MenuList>
                        <MenuItem 
                            icon={<SettingsIcon />}
                            onClick={() => navigate('/profile')}
                        >
                            Settings
                        </MenuItem>
                        <MenuItem 
                            icon={<QuestionOutlineIcon />}
                            onClick={() => console.log('Open Help')}
                        >
                            Help
                        </MenuItem>
                        <MenuItem 
                            color="red.500"
                            icon={<ArrowForwardIcon />}
                            onClick={() => {
                                onLogout && onLogout();
                                navigate('/login');
                            }}
                        >
                            Logout
                        </MenuItem>
                    </MenuList>
                </Menu>
            </Flex>
        </Flex>
    );
};

export default Header;
